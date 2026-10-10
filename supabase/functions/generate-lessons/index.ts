import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { sessionId, subtitles, title } = await req.json();

    if (!sessionId || !subtitles || !Array.isArray(subtitles) || subtitles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: sessionId, subtitles" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI lesson generation is not configured. The GEMINI_API_KEY secret has not been set on the server. Please add it in your Supabase project settings under Edge Function Secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Build the prompt for Gemini
    const subtitleText = subtitles
      .map((s: any, i: number) => `${i + 1}. [${s.timestamp_start || "00:00:00"}] ${s.korean}`)
      .join("\n");

    const prompt = `You are a Korean language teacher creating lessons for English-speaking K-drama fans.

For each Korean subtitle line below, generate:
1. Romanization (revised Romanization system)
2. English translation
3. Politeness/formality level (e.g. "합쇼체 (formal)", "해요체 (polite)", "해체 (casual)")
4. Grammar explanation (1-3 sentences explaining key grammar points)
5. 2-5 key vocabulary words, each with: hangul, romanization, English translation, part of speech

Return ONLY valid JSON in this exact format:
{
  "lessons": [
    {
      "hangul": "the original Korean line",
      "romanization": "romanized text",
      "translation": "English translation",
      "timestamp_start": "timestamp from input",
      "politeness": "formality label",
      "grammar_note": "grammar explanation",
      "vocabulary": [
        {
          "word_hangul": "word",
          "word_romanization": "romanization",
          "word_translation": "English meaning",
          "part_of_speech": "noun/verb/adjective/etc"
        }
      ]
    }
  ]
}

Subtitle lines from "${title}":
${subtitleText}

Return only the JSON, no markdown formatting or code blocks.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error (${geminiResponse.status}): ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Empty response from AI model");
    }

    // Parse the JSON from the response, stripping any markdown code fences
    const jsonText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonText);

    if (!parsed.lessons || !Array.isArray(parsed.lessons)) {
      throw new Error("Invalid AI response format: missing lessons array");
    }

    // Save lessons to database
    const lessonRows = parsed.lessons.map((lesson: any, index: number) => ({
      session_id: sessionId,
      hangul: lesson.hangul,
      romanization: lesson.romanization || "",
      translation: lesson.translation || "",
      timestamp_start: lesson.timestamp_start || subtitles[index]?.timestamp_start || null,
      timestamp_end: subtitles[index]?.timestamp_end || null,
      politeness: lesson.politeness || null,
      grammar_note: lesson.grammar_note || null,
      order_index: index,
    }));

    const { data: savedLessons, error: lessonError } = await supabase
      .from("lessons")
      .insert(lessonRows)
      .select();

    if (lessonError) throw new Error(`Failed to save lessons: ${lessonError.message}`);

    // Save vocabulary
    const vocabRows: any[] = [];
    savedLessons.forEach((lesson: any, index: number) => {
      const lessonVocab = parsed.lessons[index]?.vocabulary || [];
      lessonVocab.forEach((v: any) => {
        vocabRows.push({
          lesson_id: lesson.id,
          session_id: sessionId,
          word_hangul: v.word_hangul,
          word_romanization: v.word_romanization || "",
          word_translation: v.word_translation || "",
          part_of_speech: v.part_of_speech || null,
          is_known: false,
          is_saved: true,
        });
      });
    });

    if (vocabRows.length > 0) {
      const { error: vocabError } = await supabase
        .from("vocabulary")
        .insert(vocabRows);
      if (vocabError) throw new Error(`Failed to save vocabulary: ${vocabError.message}`);
    }

    // Update session status
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ status: "ready", lesson_count: savedLessons.length })
      .eq("id", sessionId);
    if (updateError) throw new Error(`Failed to update session: ${updateError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        lessonCount: savedLessons.length,
        vocabCount: vocabRows.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { createSession, saveDemoLessons, generateAILessons } from '@/lib/sessionService';
import { demoShows } from '@/data/demoSubtitles';
import type { SubtitleLine } from '@/types';
import {
  Camera, Sparkles, FileText, AlertCircle, Loader2, CheckCircle2,
  Chrome, Link2, Film, ChevronRight, Info, Star, Play, Wand2,
} from 'lucide-react';
import { Mascot } from '@/components/Mascot';

type ImportMode = 'demo' | 'manual' | 'capture';
type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

export function CapturePage() {
  const { navigate } = useRouter();
  const [mode, setMode] = useState<ImportMode>('demo');
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [processing, setProcessing] = useState<ProcessingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newSessionId, setNewSessionId] = useState<string | null>(null);

  const handleDemoImport = async () => {
    const show = demoShows[selectedDemo];
    setProcessing('processing');
    setErrorMsg('');
    try {
      const session = await createSession(show.title, null, true);
      await saveDemoLessons(session.id, show.subtitles);
      setNewSessionId(session.id);
      setSuccessMsg(`Imported "${show.title}" with ${show.subtitles.length} lessons`);
      setProcessing('success');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to import demo episode');
      setProcessing('error');
    }
  };

  const parseManualSubtitles = (text: string): SubtitleLine[] => {
    const lines = text.trim().split('\n').filter(Boolean);
    const subtitles: SubtitleLine[] = [];
    for (const line of lines) {
      const match = line.match(/^\[?(\d{2}:\d{2}:\d{2})\]?\s*[-–]?\s*(.+)$/);
      if (match) {
        subtitles.push({ timestamp_start: match[1], korean: match[2].trim() });
      } else if (line.trim()) {
        subtitles.push({ timestamp_start: '00:00:00', korean: line.trim() });
      }
    }
    return subtitles;
  };

  const handleManualImport = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title for the episode');
      setProcessing('error');
      return;
    }
    if (!subtitleText.trim()) {
      setErrorMsg('Please paste Korean subtitle lines');
      setProcessing('error');
      return;
    }

    setProcessing('processing');
    setErrorMsg('');

    try {
      const subtitles = parseManualSubtitles(subtitleText);
      if (subtitles.length === 0) {
        throw new Error('Could not parse any subtitle lines. Use format: [00:12:34] Korean text here');
      }

      const session = await createSession(title.trim(), sourceUrl.trim() || null, false);

      try {
        await generateAILessons(session.id, subtitles, title.trim());
        setNewSessionId(session.id);
        setSuccessMsg(`Generated ${subtitles.length} lessons from "${title.trim()}"`);
        setProcessing('success');
      } catch (aiError: any) {
        await supabase.from('sessions').delete().eq('id', session.id);
        throw aiError;
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to import subtitles');
      setProcessing('error');
    }
  };

  const reset = () => {
    setProcessing('idle');
    setErrorMsg('');
    setSuccessMsg('');
    setNewSessionId(null);
    setTitle('');
    setSourceUrl('');
    setSubtitleText('');
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-grape-800">Capture & Import</h1>
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-ink-soft text-sm font-medium">Load Korean subtitles from your K-drama to generate lessons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ModeCard
          icon={Sparkles}
          emoji="✨"
          label="Demo Mode"
          description="Try with sample K-drama subtitles"
          active={mode === 'demo'}
          onClick={() => { setMode('demo'); reset(); }}
          badge="Try it first!"
          gradient="from-lav-200 to-lav-100"
        />
        <ModeCard
          icon={FileText}
          emoji="📝"
          label="Manual Import"
          description="Paste your own Korean subtitle text"
          active={mode === 'manual'}
          onClick={() => { setMode('manual'); reset(); }}
          badge="AI-powered"
          gradient="from-bubble-200 to-bubble-100"
        />
        <ModeCard
          icon={Camera}
          emoji="🎥"
          label="Chrome Extension"
          description="Capture subtitles while watching"
          active={mode === 'capture'}
          onClick={() => { setMode('capture'); reset(); }}
          badge="Coming soon"
          gradient="from-peach-200 to-peach-100"
        />
      </div>

      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {processing === 'success' ? (
          <div className="bg-gradient-to-br from-lav-100 to-bubble-100 rounded-3xl border-2 border-white p-8 text-center card-shadow animate-bounce-in">
            <div className="flex justify-center mb-4">
              <Mascot size={80} expression="celebrating" className="animate-float" />
            </div>
            <h2 className="text-xl font-bold font-display text-grape-800 mb-2">Yay! Import successful! 🎉</h2>
            <p className="text-ink-soft text-sm mb-6 font-medium">{successMsg}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('lesson', newSessionId)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-bubble-400 to-peach-400 text-white font-bold text-sm hover:from-bubble-500 hover:to-peach-500 transition-all sticker-shadow hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4" fill="white" />
                Start learning
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-2xl border-2 border-lav-200 text-ink-soft text-sm font-bold hover:bg-lav-50 transition-colors"
              >
                Import another
              </button>
            </div>
          </div>
        ) : processing === 'processing' ? (
          <div className="bg-gradient-to-br from-sky-50 to-lav-50 rounded-3xl border-2 border-white p-12 text-center card-shadow">
            <div className="flex justify-center mb-4">
              <Mascot size={70} expression="thinking" className="animate-float" />
            </div>
            <Loader2 className="w-8 h-8 text-lav-500 animate-spin mx-auto mb-3" />
            <h2 className="text-lg font-bold font-display text-grape-800 mb-1">
              {mode === 'manual' ? 'Cooking up your lessons...' : 'Importing subtitles...'}
            </h2>
            <p className="text-sm text-ink-soft font-medium">
              {mode === 'manual'
                ? 'Our AI is analyzing Korean text, romanization, translations, and vocabulary ✨'
                : 'Parsing subtitles and building your lesson'}
            </p>
          </div>
        ) : (
          <>
            {processing === 'error' && (
              <div className="mb-4 bg-bubble-50 rounded-2xl border-2 border-bubble-200 p-4 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-bubble-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-bubble-700 font-medium">{errorMsg}</p>
                </div>
                <button onClick={reset} className="text-xs text-bubble-500 hover:text-bubble-700 font-bold">Dismiss</button>
              </div>
            )}

            {mode === 'demo' && (
              <DemoModePanel
                selectedDemo={selectedDemo}
                setSelectedDemo={setSelectedDemo}
                onImport={handleDemoImport}
              />
            )}

            {mode === 'manual' && (
              <ManualModePanel
                title={title}
                setTitle={setTitle}
                sourceUrl={sourceUrl}
                setSourceUrl={setSourceUrl}
                subtitleText={subtitleText}
                setSubtitleText={setSubtitleText}
                onImport={handleManualImport}
              />
            )}

            {mode === 'capture' && (
              <CaptureModePanel />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, emoji, label, description, active, onClick, badge, gradient }: {
  icon: typeof Sparkles;
  emoji: string;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        active
          ? `bg-gradient-to-br ${gradient} border-white card-shadow scale-[1.02]`
          : 'bg-white/60 border-lav-100 hover:border-lav-200 hover:bg-white/80'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-xl ${
        active ? 'bg-white/40' : 'bg-lav-50'
      }`}>
        {active ? <Icon className="w-5 h-5 text-grape-700" strokeWidth={2.5} /> : <span>{emoji}</span>}
      </div>
      <h3 className={`font-bold font-display text-sm mb-1 ${active ? 'text-grape-800' : 'text-ink-soft'}`}>{label}</h3>
      <p className="text-xs text-ink-soft leading-relaxed mb-2 font-medium">{description}</p>
      {badge && (
        <span className={`text-[10px] px-2.5 py-1 rounded-chip font-bold ${
          active ? 'bg-white/50 text-grape-700' : 'bg-lav-100 text-lav-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function DemoModePanel({ selectedDemo, setSelectedDemo, onImport }: {
  selectedDemo: number;
  setSelectedDemo: (i: number) => void;
  onImport: () => void;
}) {
  const show = demoShows[selectedDemo];

  return (
    <div className="bg-white/70 rounded-3xl border-2 border-lav-100 p-6 card-shadow">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-lav-100 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-lav-600" />
        </div>
        <div>
          <h2 className="font-bold font-display text-grape-800 text-sm mb-0.5">Demo Mode</h2>
          <p className="text-xs text-ink-soft leading-relaxed font-medium">
            Sample Korean subtitle lines from popular K-dramas. Demo sessions are clearly
            labeled and will never be confused with real captured data.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {demoShows.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setSelectedDemo(idx)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selectedDemo === idx
                ? 'bg-gradient-to-r from-lav-100 to-bubble-50 border-lav-300'
                : 'bg-white/50 border-lav-100 hover:border-lav-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedDemo === idx ? 'bg-lav-300' : 'bg-lav-50'
              }`}>
                <Film className={`w-4 h-4 ${selectedDemo === idx ? 'text-white' : 'text-lav-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold font-display text-grape-800 truncate">{s.title}</h3>
                <p className="text-xs text-ink-soft mt-0.5 line-clamp-1 font-medium">{s.description}</p>
              </div>
              <span className="text-xs text-ink-light flex-shrink-0 font-bold">{s.subtitles.length} lines</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-lav-50 to-cream rounded-2xl border-2 border-lav-100 p-4 mb-5">
        <p className="text-xs text-ink-light mb-2 font-bold uppercase tracking-wider">Preview</p>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {show.subtitles.slice(0, 4).map((sub, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xs text-lav-500 font-mono mt-0.5 flex-shrink-0 font-bold bg-lav-100 px-2 py-0.5 rounded-chip">{sub.timestamp_start}</span>
              <span className="font-korean text-grape-800 font-medium">{sub.korean}</span>
            </div>
          ))}
          {show.subtitles.length > 4 && (
            <p className="text-xs text-ink-light pl-2 font-medium">+ {show.subtitles.length - 4} more lines...</p>
          )}
        </div>
      </div>

      <button
        onClick={onImport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-lav-400 to-lav-500 text-white font-bold text-sm hover:from-lav-500 hover:to-lav-600 transition-all sticker-shadow hover:scale-[1.02] active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        Import demo episode ({show.subtitles.length} lessons)
      </button>
    </div>
  );
}

function ManualModePanel({ title, setTitle, sourceUrl, setSourceUrl, subtitleText, setSubtitleText, onImport }: {
  title: string;
  setTitle: (v: string) => void;
  sourceUrl: string;
  setSourceUrl: (v: string) => void;
  subtitleText: string;
  setSubtitleText: (v: string) => void;
  onImport: () => void;
}) {
  return (
    <div className="bg-white/70 rounded-3xl border-2 border-bubble-100 p-6 card-shadow">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-bubble-100 flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-5 h-5 text-bubble-600" />
        </div>
        <div>
          <h2 className="font-bold font-display text-grape-800 text-sm mb-0.5">Manual Import</h2>
          <p className="text-xs text-ink-soft leading-relaxed font-medium">
            Paste Korean subtitle lines with timestamps. Our AI will generate romanization, English
            translations, vocabulary breakdowns, and grammar notes for each line.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-ink-soft mb-1.5 uppercase tracking-wider">
            Episode Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Crash Landing on You — Episode 3"
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border-2 border-lav-100 text-ink text-sm font-medium placeholder:text-ink-light focus:outline-none focus:border-bubble-300 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-soft mb-1.5 uppercase tracking-wider">
            Source URL <span className="text-ink-light normal-case font-medium">(optional)</span>
          </label>
          <div className="relative">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/80 border-2 border-lav-100 text-ink text-sm font-medium placeholder:text-ink-light focus:outline-none focus:border-bubble-300 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-soft mb-1.5 uppercase tracking-wider">
            Korean Subtitle Lines
          </label>
          <p className="text-xs text-ink-soft mb-2 font-medium">
            Format: <code className="text-bubble-600 bg-bubble-50 px-2 py-0.5 rounded-chip font-mono">[00:12:34] Korean text here</code>
            (one per line)
          </p>
          <textarea
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            placeholder="[00:03:12] 안녕하세요. 만나서 반갑습니다.&#10;[00:05:45] 이름이 뭐예요?&#10;[00:08:20] 저는 서리준입니다."
            rows={8}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 border-2 border-lav-100 text-ink text-sm font-korean placeholder:text-ink-light focus:outline-none focus:border-bubble-300 transition-colors resize-y"
          />
        </div>
      </div>

      <button
        onClick={onImport}
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-bubble-400 to-peach-400 text-white font-bold text-sm hover:from-bubble-500 hover:to-peach-500 transition-all sticker-shadow hover:scale-[1.02] active:scale-95"
      >
        <Wand2 className="w-4 h-4" />
        Generate lessons with AI ✨
      </button>
    </div>
  );
}

function CaptureModePanel() {
  return (
    <div className="bg-white/70 rounded-3xl border-2 border-peach-100 p-8 card-shadow">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-peach-200 to-peach-300 flex items-center justify-center flex-shrink-0 sticker-shadow">
          <Chrome className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="font-bold font-display text-grape-800 text-base mb-1">Chrome Extension</h2>
          <p className="text-sm text-ink-soft leading-relaxed font-medium">
            The BingeLingo Chrome extension captures Korean subtitles directly from streaming sites
            while you watch. It sends subtitle lines with timestamps to your BingeLingo account.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-peach-50 to-butter-50 rounded-2xl border-2 border-peach-100 p-5 mb-5">
        <h3 className="text-sm font-bold font-display text-grape-800 mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            { step: 'Install the BingeLingo Chrome extension', emoji: '🔧' },
            { step: 'Open your favorite K-drama on a supported streaming site', emoji: '🍿' },
            { step: 'Click the BingeLingo icon to start capturing subtitles', emoji: '🎯' },
            { step: 'Your captured subtitles appear here automatically', emoji: '✨' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base flex-shrink-0 border-2 border-peach-100">
                {item.emoji}
              </span>
              <p className="text-sm text-ink-soft leading-relaxed pt-1 font-medium">{item.step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-bubble-50 border-2 border-bubble-100">
        <div className="w-3 h-3 rounded-full bg-bubble-400 animate-pulse-glow flex-shrink-0"></div>
        <div className="flex-1">
          <p className="text-sm font-bold text-bubble-700">Extension not connected yet</p>
          <p className="text-xs text-ink-soft mt-0.5 font-medium">
            The Chrome extension is still in development. Use Demo Mode or Manual Import to get started now!
          </p>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-lav-50 border-2 border-lav-100">
        <p className="text-xs text-ink-soft leading-relaxed font-medium">
          <strong className="text-lav-600 font-bold">Psst!</strong> Automatic subtitle capture doesn't work yet.
          But you can still try the demo episodes or paste your own subtitle text using Manual Import above!
        </p>
      </div>
    </div>
  );
}

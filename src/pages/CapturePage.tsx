import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { createSession, saveDemoLessons, generateAILessons } from '@/lib/sessionService';
import { demoShows } from '@/data/demoSubtitles';
import type { SubtitleLine } from '@/types';
import {
  Camera, Sparkles, FileText, AlertCircle, Loader2, CheckCircle2,
  Chrome, Link2, Film, ChevronRight, Info,
} from 'lucide-react';

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
        <h1 className="text-2xl md:text-3xl font-bold text-cream mb-1">Capture &amp; Import</h1>
        <p className="text-cream-muted text-sm">Load Korean subtitles from your K-drama to generate lessons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ModeCard
          icon={Sparkles}
          label="Demo Mode"
          description="Try with sample K-drama subtitles"
          active={mode === 'demo'}
          onClick={() => { setMode('demo'); reset(); }}
          badge="Recommended for testing"
        />
        <ModeCard
          icon={FileText}
          label="Manual Import"
          description="Paste your own Korean subtitle text"
          active={mode === 'manual'}
          onClick={() => { setMode('manual'); reset(); }}
          badge="AI-powered"
        />
        <ModeCard
          icon={Camera}
          label="Chrome Extension"
          description="Capture subtitles while watching"
          active={mode === 'capture'}
          onClick={() => { setMode('capture'); reset(); }}
          badge="Coming soon"
        />
      </div>

      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {processing === 'success' ? (
          <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-850 rounded-2xl border border-lavender/20 p-8 text-center card-glow">
            <div className="w-16 h-16 rounded-2xl bg-lavender/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-lavender" />
            </div>
            <h2 className="text-xl font-bold text-cream mb-2">Import successful!</h2>
            <p className="text-cream-muted text-sm mb-6">{successMsg}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('lesson', newSessionId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-lavender text-charcoal-900 font-semibold text-sm hover:bg-lavender-bright transition-colors"
              >
                Start learning
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-lg border border-charcoal-600 text-cream-muted text-sm font-medium hover:text-cream transition-colors"
              >
                Import another
              </button>
            </div>
          </div>
        ) : processing === 'processing' ? (
          <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700/50 p-12 text-center">
            <Loader2 className="w-10 h-10 text-lavender animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-cream mb-1">
              {mode === 'manual' ? 'Generating lessons with AI...' : 'Importing subtitles...'}
            </h2>
            <p className="text-sm text-cream-muted">
              {mode === 'manual'
                ? 'Analyzing Korean text, generating romanization, translations, and vocabulary'
                : 'Parsing subtitles and building your lesson'}
            </p>
          </div>
        ) : (
          <>
            {processing === 'error' && (
              <div className="mb-4 bg-rose/10 rounded-xl border border-rose/20 p-4 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-rose flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-rose">{errorMsg}</p>
                </div>
                <button onClick={reset} className="text-xs text-rose-dim hover:text-rose">Dismiss</button>
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

function ModeCard({ icon: Icon, label, description, active, onClick, badge }: {
  icon: typeof Sparkles;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
        active
          ? 'bg-charcoal-800 border-lavender/30 card-glow'
          : 'bg-charcoal-800/50 border-charcoal-700/50 hover:border-charcoal-600'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
        active ? 'bg-lavender/15' : 'bg-charcoal-700/50'
      }`}>
        <Icon className={`w-5 h-5 ${active ? 'text-lavender' : 'text-cream-muted'}`} strokeWidth={2} />
      </div>
      <h3 className={`font-semibold text-sm mb-1 ${active ? 'text-cream' : 'text-cream-dim'}`}>{label}</h3>
      <p className="text-xs text-cream-muted leading-relaxed mb-2">{description}</p>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          active ? 'bg-lavender/15 text-lavender' : 'bg-charcoal-700 text-cream-muted'
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
    <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700/50 p-6 card-glow">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-lavender/10 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-lavender" />
        </div>
        <div>
          <h2 className="font-semibold text-cream text-sm mb-0.5">Demo Mode</h2>
          <p className="text-xs text-cream-muted leading-relaxed">
            These are sample Korean subtitle lines from popular K-dramas. Demo sessions are clearly
            labeled and will never be confused with real captured data.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {demoShows.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setSelectedDemo(idx)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedDemo === idx
                ? 'bg-charcoal-700/50 border-lavender/30'
                : 'bg-charcoal-850 border-charcoal-700/30 hover:border-charcoal-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                selectedDemo === idx ? 'bg-lavender/15' : 'bg-charcoal-700/50'
              }`}>
                <Film className={`w-4 h-4 ${selectedDemo === idx ? 'text-lavender' : 'text-cream-muted'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-cream truncate">{s.title}</h3>
                <p className="text-xs text-cream-muted mt-0.5 line-clamp-1">{s.description}</p>
              </div>
              <span className="text-xs text-cream-muted flex-shrink-0">{s.subtitles.length} lines</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-charcoal-850 rounded-xl border border-charcoal-700/30 p-4 mb-5">
        <p className="text-xs text-cream-muted mb-2 font-medium uppercase tracking-wider">Preview</p>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {show.subtitles.slice(0, 4).map((sub, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xs text-lavender-dim font-mono mt-0.5 flex-shrink-0">{sub.timestamp_start}</span>
              <span className="font-korean text-cream-dim">{sub.korean}</span>
            </div>
          ))}
          {show.subtitles.length > 4 && (
            <p className="text-xs text-cream-muted pl-2">+ {show.subtitles.length - 4} more lines...</p>
          )}
        </div>
      </div>

      <button
        onClick={onImport}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lavender text-charcoal-900 font-semibold text-sm hover:bg-lavender-bright transition-colors"
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
    <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700/50 p-6 card-glow">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-lavender/10 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-lavender" />
        </div>
        <div>
          <h2 className="font-semibold text-cream text-sm mb-0.5">Manual Import</h2>
          <p className="text-xs text-cream-muted leading-relaxed">
            Paste Korean subtitle lines with timestamps. Our AI will generate romanization, English
            translations, vocabulary breakdowns, and grammar notes for each line.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-cream-muted mb-1.5 uppercase tracking-wider">
            Episode Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Crash Landing on You — Episode 3"
            className="w-full px-4 py-2.5 rounded-lg bg-charcoal-850 border border-charcoal-700 text-cream text-sm placeholder:text-cream-muted/50 focus:outline-none focus:border-lavender/40 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-cream-muted mb-1.5 uppercase tracking-wider">
            Source URL <span className="text-cream-muted/50 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-muted" />
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-charcoal-850 border border-charcoal-700 text-cream text-sm placeholder:text-cream-muted/50 focus:outline-none focus:border-lavender/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-cream-muted mb-1.5 uppercase tracking-wider">
            Korean Subtitle Lines
          </label>
          <p className="text-xs text-cream-muted mb-2">
            Format: <code className="text-lavender-dim bg-charcoal-850 px-1.5 py-0.5 rounded">[00:12:34] Korean text here</code>
            (one per line)
          </p>
          <textarea
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            placeholder="[00:03:12] 안녕하세요. 만나서 반갑습니다.&#10;[00:05:45] 이름이 뭐예요?&#10;[00:08:20] 저는 서리준입니다."
            rows={8}
            className="w-full px-4 py-3 rounded-lg bg-charcoal-850 border border-charcoal-700 text-cream text-sm font-korean placeholder:text-cream-muted/40 focus:outline-none focus:border-lavender/40 transition-colors resize-y"
          />
        </div>
      </div>

      <button
        onClick={onImport}
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lavender text-charcoal-900 font-semibold text-sm hover:bg-lavender-bright transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Generate lessons with AI
      </button>
    </div>
  );
}

function CaptureModePanel() {
  return (
    <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700/50 p-8 card-glow">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-rose/10 flex items-center justify-center flex-shrink-0">
          <Chrome className="w-6 h-6 text-rose" />
        </div>
        <div>
          <h2 className="font-semibold text-cream mb-1">Chrome Extension</h2>
          <p className="text-sm text-cream-muted leading-relaxed">
            The BingeLingo Chrome extension captures Korean subtitles directly from streaming sites
            while you watch. It sends subtitle lines with timestamps to your BingeLingo account.
          </p>
        </div>
      </div>

      <div className="bg-charcoal-850 rounded-xl border border-charcoal-700/30 p-5 mb-5">
        <h3 className="text-sm font-medium text-cream mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            'Install the BingeLingo Chrome extension from the Chrome Web Store',
            'Open your favorite K-drama on a supported streaming site',
            'Click the BingeLingo icon to start capturing subtitles',
            'Your captured subtitles appear here automatically — ready for lesson generation',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-charcoal-700 flex items-center justify-center text-xs text-lavender font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-cream-dim leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-charcoal-850 border border-charcoal-700/30">
        <div className="w-3 h-3 rounded-full bg-rose animate-pulse-glow flex-shrink-0"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-cream">Extension not connected</p>
          <p className="text-xs text-cream-muted mt-0.5">
            The Chrome extension is still in development. Use Demo Mode or Manual Import to get started now.
          </p>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-lavender/5 border border-lavender/15">
        <p className="text-xs text-cream-dim leading-relaxed">
          <strong className="text-lavender">Note:</strong> Automatic subtitle capture does not work yet.
          The extension is coming soon. In the meantime, try the demo episodes or paste your own
          subtitle text using Manual Import.
        </p>
      </div>
    </div>
  );
}

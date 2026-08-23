import { useState, useRef, useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  Mic, ClipboardPaste, Trash2, Volume2, Copy, ArrowLeftRight,
  Sparkles, GraduationCap, BookOpen, MessageCircle, Minimize2, RefreshCw,
  CheckCircle2, AlertTriangle, Loader2, Send, Camera, Upload, ScanLine,
} from 'lucide-react';
import type { TranslationMode, LanguageDirection, TranslationRecord, SupportedLanguage } from '@/types';
import { translateText, translateFromLanguage, getSupportedLanguages } from '@/lib/translate';
import { speak, stopSpeaking, isSpeechSynthesisSupported } from '@/lib/speech';
import { countWords, countSentences, countCharacters, formatTime } from '@/lib/analytics';
import { extractTextFromFile } from '@/lib/ocr';
import { AICore } from './AICore';

interface TranslatorProps {
  onHistoryAdd: (record: TranslationRecord) => void;
  setInputText: Dispatch<SetStateAction<string>>;
  inputText: string;
}

const SMART_TOOLS: { mode: TranslationMode; label: string; icon: typeof Sparkles; colorClass: string }[] = [
  { mode: 'improved', label: 'Improve Translation', icon: Sparkles, colorClass: 'text-saffron-400' },
  { mode: 'simple', label: 'Simple Hindi', icon: GraduationCap, colorClass: 'text-indiagreen-400' },
  { mode: 'formal', label: 'Formal Hindi', icon: BookOpen, colorClass: 'text-electric-400' },
  { mode: 'conversational', label: 'Conversational Hindi', icon: MessageCircle, colorClass: 'text-gold-400' },
  { mode: 'shorten', label: 'Shorten', icon: Minimize2, colorClass: 'text-saffron-400' },
  { mode: 'rephrase', label: 'Rephrase', icon: RefreshCw, colorClass: 'text-indiagreen-400' },
];

const DEFAULT_STAGES = [
  { label: 'ANALYZING INPUT', done: false },
  { label: 'UNDERSTANDING CONTEXT', done: false },
  { label: 'TRANSLATING', done: false },
  { label: 'TRANSLATION COMPLETE', done: false },
];

export function Translator({ onHistoryAdd, setInputText, inputText }: TranslatorProps) {
  const [direction, setDirection] = useState<LanguageDirection>('en-hi');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [translationTime, setTranslationTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState<'input' | 'output' | null>(null);
  const [activeTool, setActiveTool] = useState<TranslationMode | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [sourceLang, setSourceLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEnToHi = direction === 'en-hi';
  const sourceLabel = isEnToHi ? 'English' : 'हिन्दी';
  const targetLabel = isEnToHi ? 'हिन्दी' : 'English';
  const sourceLangCode = isEnToHi ? 'en' : 'hi';
  const targetLangCode = isEnToHi ? 'hi' : 'en';

  useEffect(() => {
    getSupportedLanguages().then(setLanguages);
  }, []);

  const runTranslation = useCallback(
    async (text: string, mode: TranslationMode = 'standard') => {
      if (!text.trim()) {
        setError('⚠ Please enter some English text.');
        return;
      }

      setError('');
      setSuccess(false);
      setIsTranslating(true);
      setOutputText('');
      setStages(DEFAULT_STAGES.map((s) => ({ ...s, done: false })));
      const startTime = performance.now();

      // Animate stages
      const stageTimers: ReturnType<typeof setTimeout>[] = [];
      stageTimers.push(setTimeout(() => setStages((prev) => prev.map((s, i) => i === 0 ? { ...s, done: true } : s)), 400));
      stageTimers.push(setTimeout(() => setStages((prev) => prev.map((s, i) => i === 1 ? { ...s, done: true } : s)), 900));
      stageTimers.push(setTimeout(() => setStages((prev) => prev.map((s, i) => i === 2 ? { ...s, done: true } : s)), 1400));

      const effectiveSource = sourceLang;
      const result = await translateFromLanguage(text, effectiveSource, 'hi', mode);
      if (result.detectedLanguage) setDetectedLang(result.detectedLanguage);

      stageTimers.forEach(clearTimeout);
      setStages(DEFAULT_STAGES.map((s) => ({ ...s, done: true })));

      const elapsed = Math.round(performance.now() - startTime);
      setTranslationTime(elapsed);

      if (result.error) {
        setError('⚠ Translation temporarily unavailable. Please try again.');
        setOutputText('');
      } else {
        setOutputText(result.result);
        setSuccess(true);
        onHistoryAdd({
          id: crypto.randomUUID(),
          english: text,
          hindi: result.result,
          timestamp: Date.now(),
          mode,
        });
      }

      setIsTranslating(false);
      setActiveTool(null);
    },
    [onHistoryAdd, sourceLang, sourceLangCode]
  );

  const handleTranslate = () => runTranslation(inputText, 'standard');

  const handleSmartTool = (mode: TranslationMode) => {
    if (!inputText.trim()) {
      setError('⚠ Please enter some English text first.');
      return;
    }
    setActiveTool(mode);
    // Use existing output as input for refinement tools, or original input
    const baseText = outputText && mode !== 'standard' ? inputText : inputText;
    runTranslation(baseText, mode);
  };

  const handleSpeak = () => {
    if (!isSpeechSynthesisSupported()) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setError('🎤 Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = sourceLangCode === 'en' ? 'en-US' : 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setInputText((prev) => (prev ? prev + ' ' : '') + transcript);
    };
    recognition.onerror = () => {
      setError('🎤 Microphone access is unavailable. Please check your browser permissions.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText((prev) => (prev ? prev + ' ' : '') + text);
      }
    } catch {
      setError('📋 Clipboard access is unavailable. You can paste the text manually.');
    }
  };

  const handleCopy = (text: string, which: 'input' | 'output') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {
      setError('📋 Clipboard access is unavailable. You can copy the text manually.');
    });
  };

  const handleListen = () => {
    if (!outputText) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    speak(outputText, targetLangCode, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setError('🔊 Text-to-speech is unavailable in this browser.');
      },
    });
  };

  const handleSwap = () => {
    setDirection((prev) => (prev === 'en-hi' ? 'hi-en' : 'en-hi'));
    setInputText(outputText);
    setOutputText(inputText);
    setSuccess(false);
    setError('');
    setDetectedLang(null);
  };

  const handleClearInput = () => {
    setInputText('');
    setError('');
    setDetectedLang(null);
  };

  const handleClearOutput = () => {
    setOutputText('');
    setSuccess(false);
    setTranslationTime(0);
  };

  const processExtractedText = useCallback(
    (text: string) => {
      if (!text.trim()) {
        setError('⚠ No readable text was detected. Please use a clearer image.');
        return;
      }
      setInputText(text);
      setDetectedLang(null);
      // Auto-trigger translation using the selected source language.
      runTranslation(text, 'standard');
    },
    [setInputText, runTranslation]
  );

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsExtracting(true);
    setError('');
    extractTextFromFile(file, sourceLang)
      .then(processExtractedText)
      .catch(() => {
        setError('⚠ No readable text was detected. Please use a clearer image.');
      })
      .finally(() => setIsExtracting(false));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsExtracting(true);
    setError('');
    extractTextFromFile(file, sourceLang)
      .then(processExtractedText)
      .catch(() => {
        setError('⚠ No readable text was detected. Please use a clearer image.');
      })
      .finally(() => setIsExtracting(false));
  };

  const charCount = countCharacters(inputText);
  const wordCount = countWords(inputText);
  const sentenceCount = countSentences(inputText);

  const detectedLangName = languages.find((l) => l.code === detectedLang)?.name;

  return (
    <section id="translator" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Section header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
          <span className="w-2 h-2 rounded-full bg-indiagreen-500 animate-blink" style={{ boxShadow: '0 0 8px #4ade80' }} />
          <span className="font-body font-semibold text-xs tracking-widest text-indiagreen-400 uppercase">System Online</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
          HINDISETU <span className="text-saffron-500 glow-text-saffron">AI CORE</span>
        </h2>
        <p className="font-body text-sm text-gray-400">Neural Translation Engine Ready</p>
      </div>

      {/* Main translator container */}
      <div className="gradient-border p-4 sm:p-6 scanlines relative">
        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl glass neon-border-saffron flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-saffron-400 flex-shrink-0" />
            <span className="text-sm font-body text-saffron-400">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Extracting banner */}
        {isExtracting && (
          <div className="mb-4 px-4 py-3 rounded-xl glass neon-border-blue flex items-center gap-2 animate-fade-in">
            <ScanLine className="w-5 h-5 text-electric-400 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-body text-electric-400">Extracting text with AI OCR...</span>
          </div>
        )}

        {/* Detected language badge */}
        {detectedLangName && (
          <div className="mb-4 px-4 py-2 rounded-xl glass neon-border-green flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-indiagreen-500" />
            <span className="text-xs font-body text-indiagreen-400">
              Detected language: <span className="font-semibold">{detectedLangName}</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-stretch">
          {/* Input Panel */}
          <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-[10px] tracking-widest text-gray-500 uppercase">
                  01 / {isEnToHi ? 'ENGLISH INPUT' : 'HINDI INPUT'}
                </span>
                <h3 className={`font-display font-bold text-lg text-white mt-0.5 ${!isEnToHi ? 'font-hindi' : ''}`}>
                  {sourceLabel}
                </h3>
              </div>
            </div>

            {/* Source language selector */}
            <div className="mb-3">
              <label className="font-body text-[10px] tracking-widest text-gray-500 uppercase block mb-1">
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-ink-900/70 text-white text-sm font-body rounded-lg px-3 py-2 border border-white/10 focus:border-saffron-500/40 focus:outline-none transition-colors cursor-pointer"
                aria-label="Select source language"
              >
                {languages.length === 0 ? (
                  <option value="en">English</option>
                ) : (
                  languages
                    .filter((lang) => lang.code !== 'auto' && typeof lang.name === 'string' && lang.name.trim())
                    .map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))
                )}
              </select>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isEnToHi ? 'Type, paste or speak your English text...' : 'अपना हिंदी टेक्स्ट यहाँ लिखें...'}
              className={`w-full flex-1 min-h-[180px] bg-ink-900/50 rounded-xl p-4 text-base text-white placeholder-gray-600 border border-white/5 focus:border-saffron-500/40 focus:outline-none transition-colors resize-none ${
                isEnToHi ? 'font-body' : 'font-hindi'
              }`}
              aria-label={`${sourceLabel} input`}
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold transition-all ${
                    isListening ? 'text-red-400 neon-border-saffron' : 'text-gray-300 hover:text-white'
                  }`}
                  aria-label="Speak input"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Speak'}</span>
                </button>
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-gray-300 hover:text-white transition-all"
                  aria-label="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
                {/* Camera button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isExtracting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-electric-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Capture image with camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Camera</span>
                </button>
                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-indiagreen-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Upload file"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
                <button
                  onClick={() => handleCopy(inputText, 'input')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-gray-300 hover:text-white transition-all"
                  aria-label="Copy input"
                >
                  {copied === 'input' ? <CheckCircle2 className="w-3.5 h-3.5 text-indiagreen-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied === 'input' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleClearInput}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-gray-300 hover:text-red-400 transition-all"
                  aria-label="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              aria-hidden="true"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.docx,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden="true"
            />

            <div className="mt-2 text-xs font-body text-gray-500">
              {charCount} Characters • {wordCount} Words
            </div>
          </div>

          {/* AI Core */}
          <div className="flex flex-col items-center justify-center lg:w-48 relative">
            {/* Swap button */}
            <button
              onClick={handleSwap}
              className="absolute -top-2 right-0 lg:right-auto lg:top-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass neon-border-blue btn-glow text-xs font-body font-semibold text-electric-400 hover:text-white transition-all z-10"
              aria-label="Swap languages"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>SWAP</span>
            </button>

            <AICore isTranslating={isTranslating} stages={stages} />
          </div>

          {/* Output Panel */}
          <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-[10px] tracking-widest text-gray-500 uppercase">
                  02 / {isEnToHi ? 'HINDI OUTPUT' : 'ENGLISH OUTPUT'}
                </span>
                <h3 className={`font-display font-bold text-lg text-white mt-0.5 ${isEnToHi ? 'font-hindi' : ''}`}>
                  {targetLabel}
                </h3>
              </div>
              {success && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indiagreen-500/10 neon-border-green">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indiagreen-500" />
                  <span className="text-[10px] font-body font-semibold text-indiagreen-400">Complete ✓</span>
                </div>
              )}
            </div>

            <div className={`w-full flex-1 min-h-[180px] bg-ink-900/50 rounded-xl p-4 border border-white/5 overflow-y-auto ${isEnToHi ? 'font-hindi' : 'font-body'}`}>
              {isTranslating ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-saffron-400" />
                  <span className="text-sm">Translating...</span>
                </div>
              ) : outputText ? (
                <p className="text-base text-white leading-relaxed whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-600 text-sm">Translation will appear here...</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleListen}
                disabled={!outputText}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSpeaking ? 'text-saffron-400 neon-border-saffron' : 'text-gray-300 hover:text-white'
                }`}
                aria-label="Listen to translation"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
              <button
                onClick={() => handleCopy(outputText, 'output')}
                disabled={!outputText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Copy translation"
              >
                {copied === 'output' ? <CheckCircle2 className="w-3.5 h-3.5 text-indiagreen-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied === 'output' ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleClearOutput}
                disabled={!outputText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass btn-glow text-xs font-body font-semibold text-gray-300 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Clear output"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Translate button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="group relative px-8 sm:px-12 py-4 rounded-2xl glass-strong neon-border-saffron btn-glow disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            aria-label="Translate with AI"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/20 via-electric-500/20 to-indiagreen-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2.5">
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 text-saffron-400 animate-spin" />
                  <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white">TRANSLATING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-saffron-400 group-hover:scale-110 transition-transform" />
                  <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white">TRANSLATE WITH AI</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Live Analytics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Characters', value: charCount },
            { label: 'Words', value: wordCount },
            { label: 'Sentences', value: sentenceCount },
            { label: 'Translation Time', value: translationTime ? formatTime(translationTime) : '—' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-3 text-center">
              <div className="font-display font-bold text-xl text-white">{stat.value}</div>
              <div className="font-body text-[10px] tracking-wider text-gray-500 uppercase mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Translation Tools */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4 text-saffron-400" />
          <h3 className="font-display font-bold text-sm tracking-widest text-gray-300 uppercase">Advanced AI Tools</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SMART_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.mode;
            return (
              <button
                key={tool.mode}
                onClick={() => handleSmartTool(tool.mode)}
                disabled={isTranslating}
                className="group glass rounded-xl p-4 btn-glow disabled:opacity-50 disabled:cursor-not-allowed text-left hover:bg-white/5 transition-all"
              >
                <Icon className={`w-5 h-5 mb-2 ${tool.colorClass} group-hover:scale-110 transition-transform`} />
                <div className="font-body font-semibold text-xs text-gray-300 group-hover:text-white transition-colors">
                  {tool.label}
                </div>
                {isActive && (
                  <Loader2 className="w-3 h-3 mt-1 animate-spin text-saffron-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

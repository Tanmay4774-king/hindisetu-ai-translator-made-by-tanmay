import { useState, useRef, useEffect } from 'react';
import { Mic, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { SpeechStatus } from '@/types';

interface VoiceAIProps {
  onCapture: (text: string) => void;
}

export function VoiceAI({ onCapture }: VoiceAIProps) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const startListening = async () => {
    setError('');
    setStatus('listening');

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setStatus('error');
      setError('🎤 Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg);
        rafRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      setStatus('error');
      setError('🎤 Microphone access is unavailable. Please check your browser permissions.');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      cleanup();
      setStatus('captured');
      if (transcript) onCapture(transcript);
      setTimeout(() => setStatus('idle'), 2000);
    };

    recognition.onerror = () => {
      cleanup();
      setStatus('error');
      setError('🎤 Microphone access is unavailable. Please check your browser permissions.');
    };

    recognition.onend = () => {
      if (status === 'listening') {
        cleanup();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    cleanup();
    setStatus('idle');
  };

  // Generate wave bars
  const bars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <section id="voice" className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">
          VOICE <span className="text-saffron-500 glow-text-saffron">AI</span>
        </h2>
        <p className="font-body text-base text-gray-400 italic">"Speak naturally. Let HindiSetu understand."</p>
      </div>

      <div className="gradient-border p-6 sm:p-10 scanlines flex flex-col items-center">
        {error && (
          <div className="mb-6 w-full px-4 py-3 rounded-xl glass neon-border-saffron flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-saffron-400 flex-shrink-0" />
            <span className="text-sm font-body text-saffron-400">{error}</span>
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={status === 'listening' ? stopListening : startListening}
          className="relative group btn-glow"
          aria-label="Toggle voice recording"
        >
          <div
            className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
              status === 'listening'
                ? 'bg-red-500/20 neon-border-saffron animate-pulse-glow-saffron'
                : status === 'captured'
                ? 'bg-indiagreen-500/20 neon-border-green'
                : 'glass-strong neon-border-blue'
            }`}
          >
            {/* Ripple rings when listening */}
            {status === 'listening' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-[ripple_1.5s_ease-out_infinite]" />
                <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-[ripple_1.5s_ease-out_infinite]" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {status === 'captured' ? (
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-indiagreen-500" />
            ) : status === 'listening' ? (
              <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-red-400" />
            ) : (
              <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-electric-400 group-hover:scale-110 transition-transform" />
            )}
          </div>
        </button>

        {/* Status text */}
        <div className="mt-6 text-center min-h-[28px]">
          {status === 'listening' && (
            <p className="font-display font-bold text-sm tracking-widest text-red-400 animate-blink uppercase">
              🔴 Listening...
            </p>
          )}
          {status === 'captured' && (
            <p className="font-display font-bold text-sm tracking-widest text-indiagreen-400 uppercase">
              ✓ Voice Captured
            </p>
          )}
          {status === 'idle' && (
            <p className="font-display font-bold text-sm tracking-widest text-gray-400 uppercase">
              🎤 Tap to Speak
            </p>
          )}
        </div>

        {/* Sound waves */}
        {status === 'listening' && (
          <div className="mt-6 flex items-center justify-center gap-1 h-16">
            {bars.map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-saffron-500 to-electric-500"
                style={{
                  height: `${Math.max(8, Math.min(56, (audioLevel / 255) * 56 + Math.sin(Date.now() / 200 + i) * 8 + 8))}px`,
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Hint */}
        <p className="mt-6 text-xs font-body text-gray-500 text-center max-w-md">
          Speak in English. Your words will be automatically placed in the translator input above.
        </p>
      </div>
    </section>
  );
}

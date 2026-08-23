export function getHindiVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang === 'hi-IN') ||
    voices.find((v) => v.lang.startsWith('hi')) ||
    null
  );
}

export function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang === 'en-IN') ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

export function speak(
  text: string,
  lang: 'hi' | 'en',
  handlers?: { onEnd?: () => void; onStart?: () => void; onError?: () => void }
): void {
  if (!window.speechSynthesis) {
    handlers?.onError?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = lang === 'hi' ? getHindiVoice() : getEnglishVoice();

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  }

  utterance.rate = 0.92;
  utterance.pitch = 1;

  utterance.onstart = () => handlers?.onStart?.();
  utterance.onend = () => handlers?.onEnd?.();
  utterance.onerror = () => handlers?.onError?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

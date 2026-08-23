export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationRecord {
  id: string;
  english: string;
  hindi: string;
  timestamp: number;
  mode: 'standard' | 'improved' | 'simple' | 'formal' | 'conversational' | 'shorten' | 'rephrase';
}

export interface HindiWord {
  hindi: string;
  english: string;
  meaning: string;
  ipa?: string;
}

export interface HindiQuote {
  text: string;
  author: string;
}

export type TranslationMode = 'standard' | 'improved' | 'simple' | 'formal' | 'conversational' | 'shorten' | 'rephrase';

export type LanguageDirection = 'en-hi' | 'hi-en';

export interface TranslationStage {
  label: string;
  done: boolean;
}

export type SpeechStatus = 'idle' | 'listening' | 'captured' | 'error';

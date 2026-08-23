import type { TranslationMode, SupportedLanguage } from '@/types';

interface GoogleTranslateResponse {
  0: Array<[string, string?, string?, Array<[string, number]>?]>;
  2?: string;
}

interface MyMemoryResponse {
  responseData: { translatedText: string };
  responseStatus: number;
}

async function googleTranslate(text: string, source: string, target: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation request failed (${res.status})`);
  const data = (await res.json()) as GoogleTranslateResponse;
  const segments = data[0];
  if (!segments || segments.length === 0) return '';
  return segments.map((seg) => seg[0]).join('');
}

async function myMemoryTranslate(text: string, source: string, target: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation request failed (${res.status})`);
  const data: MyMemoryResponse = await res.json();
  if (data.responseStatus !== 200) throw new Error('Translation service error');
  return data.responseData.translatedText;
}

const SYSTEM_PROMPTS: Record<TranslationMode, string> = {
  standard: 'Translate the following text to Hindi. Return only the Hindi translation, nothing else.',
  improved: 'Translate the following text to natural, fluent Hindi. Make it sound like a native Hindi speaker wrote it. Return only the Hindi translation.',
  simple: 'Translate the following text to simple, easy-to-understand Hindi using common everyday words. Return only the Hindi translation.',
  formal: 'Translate the following text to formal, respectful Hindi suitable for official or literary contexts. Return only the Hindi translation.',
  conversational: 'Translate the following text to natural conversational Hindi as spoken in everyday life. Return only the Hindi translation.',
  shorten: 'Translate the following text to Hindi, but make it as concise as possible while keeping the meaning. Return only the Hindi translation.',
  rephrase: 'Translate the following text to Hindi using a different natural phrasing than a literal translation. Return only the Hindi translation.',
};

interface GeminiResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
  error?: { message: string };
}

async function geminiTranslate(text: string, mode: TranslationMode): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  const systemInstruction = SYSTEM_PROMPTS[mode];
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          temperature: mode === 'rephrase' ? 0.8 : 0.4,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Request failed (${response.status})`);
  }

  const data: GeminiResponse = await response.json();
  const hindi = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  if (!hindi) throw new Error('No translation was returned.');
  return hindi;
}

// Comprehensive fallback list of languages supported by Google Translate.
// Used only when the live /translate_a/l endpoint is unreachable.
const FALLBACK_LANGUAGES: SupportedLanguage[] = [
  // India / South Asia
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  // Europe
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  // East / Southeast Asia
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  // Middle East / Central Asia
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  // Africa
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  // Other supported languages
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'hmn', name: 'Hmong', nativeName: 'Hmong' },
  { code: 'mi', name: 'Maori', nativeName: 'Māori' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'jw', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'gd', name: 'Scots Gaelic', nativeName: 'Gàidhlig' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho' },
  { code: 'sn', name: 'Shona', nativeName: 'ChiShona' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татар' },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇر' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'om', name: 'Oromo', nativeName: 'Oromoo' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu' },
  { code: 'fy', name: 'Frisian', nativeName: 'Frysk' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'ckb', name: 'Kurdish (Sorani)', nativeName: 'کوردی' },
];

export async function getSupportedLanguages(): Promise<SupportedLanguage[]> {
  try {
    const res = await fetch('https://translate.googleapis.com/translate_a/l?client=gtx');
    if (!res.ok) return FALLBACK_LANGUAGES;
    const data = await res.json();
    const languages: SupportedLanguage[] = [];
    const seen = new Set<string>();

    const pushPair = (codeRaw: unknown, nameRaw: unknown) => {
      if (typeof codeRaw !== 'string') return;
      const code = codeRaw.trim();
      if (!code || code === 'auto' || seen.has(code)) return;
      const safeName =
        typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : code;
      seen.add(code);
      languages.push({ code, name: safeName, nativeName: safeName });
    };

    if (Array.isArray((data as { sl?: unknown[] }).sl)) {
      for (const entry of (data as { sl: unknown[] }).sl) {
        if (Array.isArray(entry)) pushPair(entry[0], entry[1]);
      }
    } else {
      for (const [code, name] of Object.entries(data as Record<string, unknown>)) {
        pushPair(code, name);
      }
    }
    return languages.length > 0 ? languages : FALLBACK_LANGUAGES;
  } catch {
    return FALLBACK_LANGUAGES;
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.slice(0, 200))}`;
    const res = await fetch(url);
    if (!res.ok) return 'en';
    const data = (await res.json()) as GoogleTranslateResponse;
    return data[2] || 'en';
  } catch {
    return 'en';
  }
}

export async function translateFromLanguage(
  text: string,
  source: string,
  target: string = 'hi',
  mode: TranslationMode = 'standard'
): Promise<{ result: string; error?: string; detectedLanguage?: string }> {
  if (!text.trim()) {
    return { result: '', error: 'Please enter some text to translate.' };
  }

  let actualSource = source;
  let detectedLanguage: string | undefined;

  if (source === 'auto') {
    detectedLanguage = await detectLanguage(text);
    actualSource = detectedLanguage;
    if (actualSource === target) {
      return { result: text, detectedLanguage };
    }
  }

  // For enhanced modes, try Gemini first if available
  if (mode !== 'standard') {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (apiKey) {
      try {
        const hindi = await geminiTranslate(text, mode);
        return { result: hindi, detectedLanguage };
      } catch {
        // Fall through to basic translation
      }
    }
  }

  // Standard translation: use free APIs
  try {
    let result = '';
    try {
      result = await googleTranslate(text, actualSource, target);
    } catch {
      result = await myMemoryTranslate(text, actualSource, target);
    }
    if (!result) {
      return { result: '', error: 'No translation was returned. Please try again.', detectedLanguage };
    }
    return { result, detectedLanguage };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { result: '', error: msg, detectedLanguage };
  }
}

// Keep backward compatibility with existing callers
export async function translateText(
  text: string,
  mode: TranslationMode = 'standard'
): Promise<{ hindi: string; error?: string }> {
  const { result, error } = await translateFromLanguage(text, 'en', 'hi', mode);
  return { hindi: result, error };
}

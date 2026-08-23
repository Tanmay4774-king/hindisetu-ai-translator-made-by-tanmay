// OCR and document extraction utilities.
// Image OCR uses Tesseract.js with real pixel preprocessing (resize, grayscale,
// contrast stretch) and multi-language support. Heavy deps are dynamically
// imported on first use so initial page load stays fast.

// Map of source-language codes (matching the translator's language codes) to
// Tesseract.js trained-data language codes. Tesseract uses ISO 639-1/3 codes
// that differ from Google Translate's codes in a few cases.
const TESSERACT_LANG_MAP: Record<string, string> = {
  en: 'eng',
  hi: 'hin',
  bn: 'ben',
  gu: 'guj',
  mr: 'mar',
  pa: 'pan',
  ta: 'tam',
  te: 'tel',
  kn: 'kan',
  ml: 'mal',
  ur: 'urd',
  ne: 'nep',
  sa: 'san',
  es: 'spa',
  fr: 'fra',
  de: 'deu',
  it: 'ita',
  pt: 'por',
  ru: 'rus',
  ar: 'ara',
  zh: 'chi_sim',
  ja: 'jpn',
  ko: 'kor',
};

function tesseractLang(sourceLang: string): string {
  return TESSERACT_LANG_MAP[sourceLang] ?? 'eng';
}

// Load an image File into an HTMLImageElement (decoded, ready to draw).
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load the image.'));
    };
    img.src = url;
  });
}

// Preprocess the image: resize to a sensible working width, convert to
// grayscale, and apply a contrast stretch so Tesseract has cleaner input.
function preprocessImage(img: HTMLImageElement): HTMLCanvasElement {
  const MAX_WIDTH = 1600;
  const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not supported in this browser.');

  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Grayscale + build a luminance histogram for contrast stretching.
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = lum;
    histogram[lum]++;
  }

  // Determine 0.5% and 99.5% percentile bounds for contrast stretch.
  const totalPixels = w * h;
  const lowCut = totalPixels * 0.005;
  const highCut = totalPixels * 0.995;
  let low = 0;
  let high = 255;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += histogram[i];
    if (acc >= lowCut) { low = i; break; }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += histogram[i];
    if (acc >= highCut) { high = i; break; }
  }
  if (high <= low) { low = 0; high = 255; }

  const range = high - low || 1;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.max(0, Math.min(255, Math.round(((data[i] - low) / range) * 255)));
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export async function extractTextFromImage(file: File, sourceLang: string = 'en'): Promise<string> {
  const Tesseract = (await import('tesseract.js')).default;
  const lang = tesseractLang(sourceLang);

  const img = await loadImage(file);
  const canvas = preprocessImage(img);

  const { data } = await Tesseract.recognize(canvas, lang, {
    logger: () => {},
  });

  // Preserve reading order: Tesseract returns text in natural reading order
  // (top-to-bottom, left-to-right). We keep paragraph breaks via newlines.
  const raw = (data.text || '').trim();
  if (!raw) return '';

  // Collapse excessive blank lines but keep paragraph structure.
  return raw
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractTextFromFile(file: File, sourceLang: string = 'en'): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(name)) {
    return extractTextFromImage(file, sourceLang);
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  }
  if (type.startsWith('text/') || /\.(txt|md)$/.test(name)) {
    return file.text();
  }

  throw new Error('Unsupported file type. Please upload JPG, PNG, PDF, or DOCX files.');
}

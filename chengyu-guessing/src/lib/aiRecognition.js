import { sanitizeHanzi, sanitizeHanziList, sanitizeParts, sanitizeTone } from './search.js';

const SLOT_COUNT = 4;

function normalizeSlots(value, normalizer) {
  return Array.from({ length: SLOT_COUNT }, (_, index) => normalizer(Array.isArray(value) ? value[index] : '', index));
}

function normalizePartList(value) {
  if (Array.isArray(value)) {
    return sanitizeParts(value.join(' '));
  }

  return sanitizeParts(String(value || ''));
}

export function normalizeRecognition(raw) {
  const fixedChars = normalizeSlots(raw.fixedChars, sanitizeHanzi);

  return {
    globalChars: Array.from(new Set(sanitizeHanziList((raw.globalChars || []).join?.('') ?? raw.globalChars))),
    globalParts: Array.from(new Set(normalizePartList(raw.globalParts))),
    globalExcludeChars: Array.from(new Set(sanitizeHanziList((raw.globalExcludeChars || []).join?.('') ?? raw.globalExcludeChars))),
    fixedChars,
    tones: normalizeSlots(raw.tones, (value, index) => (fixedChars[index] ? '' : sanitizeTone(String(value || '')))),
    positionParts: normalizeSlots(raw.positionParts, (value, index) => (fixedChars[index] ? [] : normalizePartList(value))),
    excludeTones: normalizeSlots(raw.excludeTones, (value, index) => (fixedChars[index] ? '' : sanitizeTone(String(value || '')))),
    excludeParts: normalizeSlots(raw.excludeParts, (value, index) => (fixedChars[index] ? [] : normalizePartList(value))),
    excludeChars: normalizeSlots(raw.excludeChars, (value, index) => (fixedChars[index] ? '' : sanitizeHanzi(String(value || '')))),
    notes: String(raw.notes || '').trim(),
  };
}

export async function recognizeImageFilters(imageDataUrl) {
  const response = await fetch('/api/recognize', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageDataUrl }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error || `识别接口请求失败：HTTP ${response.status}`);
  }

  const payload = await response.json();
  return normalizeRecognition(payload.conditions || payload);
}

const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];

function splitInitialFinal(plain) {
  const initial = INITIALS.find((item) => plain.startsWith(item)) || '';
  const final = plain.slice(initial.length);
  return { initial, final };
}

export function normalizeSyllable(raw) {
  const original = raw.trim();
  if (!original) {
    return { raw: '', plain: '', tone: '0', initial: '', final: '', parts: [] };
  }

  let tone = '0';
  let plain = '';

  for (const char of original.normalize('NFD')) {
    if (/\p{Mark}/u.test(char)) {
      continue;
    }

    if (char === 'ü' || char === 'ǖ' || char === 'ǘ' || char === 'ǚ' || char === 'ǜ') {
      plain += 'u';
      if (char !== 'ü') {
        tone = String('ǖǘǚǜ'.indexOf(char) + 1);
      }
      continue;
    }

    plain += char.toLowerCase();
  }

  for (const forms of [
    ['ā', 'á', 'ǎ', 'à'],
    ['ē', 'é', 'ě', 'è'],
    ['ī', 'í', 'ǐ', 'ì'],
    ['ō', 'ó', 'ǒ', 'ò'],
    ['ū', 'ú', 'ǔ', 'ù'],
    ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  ]) {
    for (let index = 0; index < forms.length; index += 1) {
      if (original.includes(forms[index])) {
        tone = String(index + 1);
      }
    }
  }

  plain = plain.replace(/[^a-z]/g, '');
  const { initial, final } = splitInitialFinal(plain);
  const parts = [initial, final].filter(Boolean);

  return { raw: original, plain, tone, initial, final, parts };
}

export function splitPinyin(pinyin) {
  return pinyin
    .trim()
    .split(/\s+/)
    .map(normalizeSyllable)
    .slice(0, 4);
}

export function prepareIdioms(source) {
  return source
    .filter((item) => typeof item.word === 'string' && item.word.length === 4 && typeof item.pinyin === 'string')
    .map((item) => {
      const syllables = splitPinyin(item.pinyin);
      if (syllables.length !== 4) {
        return null;
      }

      return {
        ...item,
        characters: Array.from(item.word),
        syllables,
        joinedParts: syllables.flatMap((syllable) => syllable.parts),
      };
    })
    .filter(Boolean);
}

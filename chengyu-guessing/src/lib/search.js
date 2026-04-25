export const MAX_RESULTS = 200;

const VALID_PARTS = new Set([
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w',
  'a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'er',
  'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
  'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ong',
  'ue', 've', 'v', 'van', 'vn',
]);

export const sanitizeTone = (value) => value.replace(/[^0-4]/g, '').slice(0, 1);
export const sanitizeHanzi = (value) => (value.match(/[\p{Script=Han}]/gu) || []).at(-1) || '';
export const sanitizeHanziList = (value) => value.match(/[\p{Script=Han}]/gu) || [];
export const sanitizeParts = (value) =>
  value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((item) => item.replace(/[^a-z]/g, ''))
    .filter(Boolean);

export function getInvalidParts(value) {
  return sanitizeParts(value).filter((part) => !VALID_PARTS.has(part));
}

function intersectPools(pools) {
  if (!pools.length) {
    return null;
  }

  const normalized = pools
    .map((pool) => Array.from(new Set(pool)))
    .sort((a, b) => a.length - b.length);

  let current = new Set(normalized[0]);
  for (let index = 1; index < normalized.length; index += 1) {
    const next = new Set(normalized[index]);
    current = new Set(Array.from(current).filter((id) => next.has(id)));
    if (!current.size) {
      break;
    }
  }

  return Array.from(current);
}

function matchesParts(syllable, parts) {
  return parts.every((part) => syllable.parts.includes(part));
}

export function buildIndexes(records) {
  const globalPart = new Map();
  const globalChar = new Map();
  const positionPart = Array.from({ length: 4 }, () => new Map());
  const tone = Array.from({ length: 4 }, () => new Map());
  const fixedChar = Array.from({ length: 4 }, () => new Map());

  records.forEach((record, id) => {
    const seenGlobalParts = new Set();
    const seenGlobalChars = new Set();

    record.syllables.forEach((syllable, index) => {
      const char = record.characters[index];
      if (!fixedChar[index].has(char)) {
        fixedChar[index].set(char, []);
      }
      fixedChar[index].get(char).push(id);

      if (!seenGlobalChars.has(char)) {
        if (!globalChar.has(char)) {
          globalChar.set(char, []);
        }
        globalChar.get(char).push(id);
        seenGlobalChars.add(char);
      }

      syllable.parts.forEach((part) => {
        if (!positionPart[index].has(part)) {
          positionPart[index].set(part, []);
        }
        positionPart[index].get(part).push(id);

        if (!seenGlobalParts.has(part)) {
          if (!globalPart.has(part)) {
            globalPart.set(part, []);
          }
          globalPart.get(part).push(id);
          seenGlobalParts.add(part);
        }
      });

      if (!tone[index].has(syllable.tone)) {
        tone[index].set(syllable.tone, []);
      }
      tone[index].get(syllable.tone).push(id);
    });
  });

  return { globalPart, globalChar, positionPart, tone, fixedChar };
}

export function collectFilters(dom) {
  const globalParts = sanitizeParts(dom.globalLetters.value);
  const rawGlobalChars = sanitizeHanziList(dom.globalChars.value);
  const globalExcludeChars = sanitizeHanziList(dom.globalExcludeChars.value);

  const fixedChars = dom.fixedCharInputs.map((input) => sanitizeHanzi(input.value));
  const tones = dom.toneInputs.map((input) => {
    input.value = sanitizeTone(input.value);
    return input.value;
  });
  const positionParts = dom.positionInputs.map((input) => sanitizeParts(input.value));
  const excludeTones = dom.excludeToneInputs.map((input) => {
    input.value = sanitizeTone(input.value);
    return input.value;
  });
  const excludeParts = dom.excludeInputs.map((input) => sanitizeParts(input.value));
  const excludeChars = dom.excludeCharInputs.map((input) => sanitizeHanzi(input.value));

  const derivedGlobalChars = Array.from(new Set(excludeChars.filter(Boolean)));
  const effectiveGlobalChars = Array.from(new Set([...rawGlobalChars, ...derivedGlobalChars]));

  if (dom.globalCharAppendHint) {
    dom.globalCharAppendHint.textContent = derivedGlobalChars.length
      ? `自动追加：${derivedGlobalChars.join(' ')}`
      : '自动追加：无';
  }

  let activeCount = Number(globalParts.length > 0) + Number(rawGlobalChars.length > 0) + Number(globalExcludeChars.length > 0);
  for (let index = 0; index < 4; index += 1) {
    if (fixedChars[index]) {
      activeCount += 1;
      continue;
    }
    if (tones[index]) activeCount += 1;
    if (positionParts[index].length) activeCount += 1;
    if (excludeTones[index]) activeCount += 1;
    if (excludeParts[index].length) activeCount += 1;
    if (excludeChars[index]) activeCount += 1;
  }

  return {
    globalParts,
    rawGlobalChars,
    globalExcludeChars,
    effectiveGlobalChars,
    fixedChars,
    tones,
    positionParts,
    excludeTones,
    excludeParts,
    excludeChars,
    activeCount,
  };
}

function buildPositivePools(filters, indexes) {
  const pools = [];

  filters.fixedChars.forEach((char, index) => {
    if (char) pools.push(indexes.fixedChar[index].get(char) || []);
  });

  filters.tones.forEach((tone, index) => {
    if (!filters.fixedChars[index] && tone) pools.push(indexes.tone[index].get(tone) || []);
  });

  filters.positionParts.forEach((parts, index) => {
    if (filters.fixedChars[index]) return;
    parts.forEach((part) => {
      pools.push(indexes.positionPart[index].get(part) || []);
    });
  });

  filters.effectiveGlobalChars.forEach((char) => {
    pools.push(indexes.globalChar.get(char) || []);
  });

  filters.globalParts.forEach((part) => {
    pools.push(indexes.globalPart.get(part) || []);
  });

  return pools;
}

function passesNegativeFilters(record, filters) {
  if (filters.globalExcludeChars.length && filters.globalExcludeChars.some((char) => record.characters.includes(char))) {
    return false;
  }

  for (let index = 0; index < 4; index += 1) {
    if (filters.fixedChars[index]) {
      continue;
    }

    const excludeTone = filters.excludeTones[index];
    if (excludeTone && record.syllables[index]?.tone === excludeTone) {
      return false;
    }

    const excludes = filters.excludeParts[index];
    if (excludes.length && excludes.some((part) => record.syllables[index]?.parts.includes(part))) {
      return false;
    }

    const excludeChar = filters.excludeChars[index];
    if (excludeChar) {
      if (record.characters[index] === excludeChar) {
        return false;
      }
      const existsElsewhere = record.characters.some((char, charIndex) => charIndex !== index && char === excludeChar);
      if (!existsElsewhere) {
        return false;
      }
    }
  }

  return true;
}

export function getCandidateIds(filters, idioms, indexes) {
  const positivePools = buildPositivePools(filters, indexes);
  const seeded = intersectPools(positivePools);
  const baseIds = seeded ?? idioms.map((_, index) => index);

  if (
    !filters.globalExcludeChars.length &&
    !filters.excludeTones.some(Boolean) &&
    !filters.excludeParts.some((parts) => parts.length) &&
    !filters.excludeChars.some(Boolean)
  ) {
    return baseIds;
  }

  return baseIds.filter((id) => passesNegativeFilters(idioms[id], filters));
}

export function computeMatch(record, filters) {
  let score = 0;
  const marks = [[], [], [], []];

  if (filters.globalParts.length) {
    const allPresent = filters.globalParts.every((part) => record.joinedParts.includes(part));
    if (!allPresent) return { score: -1, marks };
    score += 1;
    record.syllables.forEach((syllable, index) => {
      filters.globalParts.forEach((part) => {
        if (syllable.parts.includes(part)) marks[index].push(part);
      });
    });
  }

  if (filters.rawGlobalChars.length) {
    const allPresent = filters.rawGlobalChars.every((char) => record.characters.includes(char));
    if (!allPresent) return { score: -1, marks };
    score += 1;
  }

  if (filters.globalExcludeChars.length) {
    if (filters.globalExcludeChars.some((char) => record.characters.includes(char))) {
      return { score: -1, marks };
    }
    score += 1;
  }

  for (let index = 0; index < 4; index += 1) {
    const fixedChar = filters.fixedChars[index];
    if (fixedChar) {
      if (record.characters[index] !== fixedChar) return { score: -1, marks };
      score += 1;
      continue;
    }

    const tone = filters.tones[index];
    if (tone) {
      if (record.syllables[index]?.tone !== tone) return { score: -1, marks };
      score += 1;
    }

    const parts = filters.positionParts[index];
    if (parts.length) {
      if (!matchesParts(record.syllables[index], parts)) return { score: -1, marks };
      score += 1;
      marks[index].push(...parts);
    }

    const excludeTone = filters.excludeTones[index];
    if (excludeTone) {
      if (record.syllables[index]?.tone === excludeTone) return { score: -1, marks };
      score += 1;
    }

    const excludes = filters.excludeParts[index];
    if (excludes.length) {
      if (excludes.some((part) => record.syllables[index]?.parts.includes(part))) return { score: -1, marks };
      score += 1;
    }

    const excludeChar = filters.excludeChars[index];
    if (excludeChar) {
      if (record.characters[index] === excludeChar) return { score: -1, marks };
      const existsElsewhere = record.characters.some((char, charIndex) => charIndex !== index && char === excludeChar);
      if (!existsElsewhere) return { score: -1, marks };
      score += 1;
    }
  }

  return { score, marks };
}

export function rankMatches(candidateIds, idioms, filters) {
  return candidateIds
    .map((id) => {
      const record = idioms[id];
      const match = computeMatch(record, filters);
      return { record, ...match };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.record.word.localeCompare(b.record.word, 'zh-Hans-CN');
    });
}

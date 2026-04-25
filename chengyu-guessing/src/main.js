import './styles.css';
import { prepareIdioms } from './lib/pinyin.js';
import { renderLoadError, renderResults } from './lib/render.js';
import { MAX_RESULTS, buildIndexes, collectFilters, getCandidateIds, getInvalidParts, rankMatches } from './lib/search.js';
import { bindDom, createAppTemplate } from './lib/template.js';

const DATA_URL = '/idiom.json';

document.querySelector('#app').innerHTML = createAppTemplate();

const dom = bindDom();
let idioms = [];
let indexes = null;

const debounce = (fn, wait = 120) => {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
};

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    if (!ok) {
      console.error(error);
    }
    return ok;
  }
}

function applyPartValidation(input) {
  if (!input.dataset.validate) {
    return;
  }

  const invalid = getInvalidParts(input.value);
  const errorNode = input.parentElement?.querySelector('.field-error');
  input.classList.toggle('input-invalid', invalid.length > 0 && !input.disabled);

  if (invalid.length && !input.disabled) {
    const message = `可能不合法: ${invalid.join(', ')}`;
    input.title = `可能不是合法声母/韵母: ${invalid.join(', ')}`;
    if (errorNode) {
      errorNode.textContent = message;
    }
  } else {
    input.removeAttribute('title');
    if (errorNode) {
      errorNode.textContent = '';
    }
  }
}

function syncPositionLocks() {
  dom.fixedCharInputs.forEach((input, index) => {
    const locked = Boolean(input.value.trim());
    const includeCard = dom.positionCards[index];
    const excludeCard = dom.excludeCards[index];
    const linkedInputs = [
      dom.toneInputs[index],
      dom.positionInputs[index],
      dom.excludeToneInputs[index],
      dom.excludeInputs[index],
      dom.excludeCharInputs[index],
    ];

    includeCard.classList.toggle('slot-card-locked', locked);
    excludeCard.classList.toggle('slot-card-locked', locked);

    linkedInputs.forEach((field) => {
      if (locked) {
        field.value = '';
      }
      field.disabled = locked;
      field.classList.toggle('is-disabled', locked);
    });
  });
}

function refreshValidation() {
  document.querySelectorAll('[data-validate="parts"]').forEach((input) => applyPartValidation(input));
}

function syncFilledInputs() {
  document.querySelectorAll('input').forEach((input) => {
    input.classList.toggle('input-filled', Boolean(input.value.trim()));
  });
}

function search() {
  const filters = collectFilters(dom);
  const candidateIds = getCandidateIds(filters, idioms, indexes);
  const ranked = rankMatches(candidateIds, idioms, filters);
  renderResults(dom, idioms, ranked.slice(0, MAX_RESULTS), filters, ranked.length);
}

async function initialize() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const source = await response.json();
    idioms = prepareIdioms(source);
    indexes = buildIndexes(idioms);
    dom.stats.textContent = `词库读取完成，共 ${idioms.length.toLocaleString()} 条四字成语。`;
    syncPositionLocks();
    syncFilledInputs();
    refreshValidation();
    renderResults(dom, idioms, [], collectFilters(dom));
  } catch (error) {
    renderLoadError(dom, error);
  }
}

const debouncedSearch = debounce(() => {
  syncPositionLocks();
  syncFilledInputs();
  refreshValidation();
  search();
}, 80);

[
  dom.globalLetters,
  dom.globalChars,
  dom.globalExcludeChars,
  ...dom.fixedCharInputs,
  ...dom.toneInputs,
  ...dom.positionInputs,
  ...dom.excludeToneInputs,
  ...dom.excludeInputs,
  ...dom.excludeCharInputs,
].forEach((input) => {
  input.addEventListener('input', debouncedSearch);
});

dom.showMeaningToggle.addEventListener('change', search);

dom.results.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-button');
  if (!button) {
    return;
  }

  const copied = await copyToClipboard(button.dataset.word || '');
  const originalHtml = button.innerHTML;
  const originalTitle = button.title;
  button.innerHTML = copied ? '<span class="copy-feedback">✓</span>' : '<span class="copy-feedback">!</span>';
  button.title = copied ? '已复制' : '复制失败';
  window.setTimeout(() => {
    button.innerHTML = originalHtml;
    button.title = originalTitle;
  }, 1200);
});

dom.resetButton.addEventListener('click', () => {
  dom.globalLetters.value = '';
  dom.globalChars.value = '';
  dom.globalExcludeChars.value = '';
  dom.fixedCharInputs.forEach((input) => {
    input.value = '';
  });
  dom.toneInputs.forEach((input) => {
    input.value = '';
  });
  dom.positionInputs.forEach((input) => {
    input.value = '';
  });
  dom.excludeToneInputs.forEach((input) => {
    input.value = '';
  });
  dom.excludeInputs.forEach((input) => {
    input.value = '';
  });
  dom.excludeCharInputs.forEach((input) => {
    input.value = '';
  });
  syncPositionLocks();
  syncFilledInputs();
  refreshValidation();
  search();
  dom.globalLetters.focus();
});

initialize();

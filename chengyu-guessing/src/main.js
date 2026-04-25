import './styles.css';
import { recognizeImageFilters } from './lib/aiRecognition.js';
import { prepareIdioms } from './lib/pinyin.js';
import { renderLoadError, renderResults } from './lib/render.js';
import { MAX_RESULTS, buildIndexes, collectFilters, getCandidateIds, getInvalidParts, rankMatches } from './lib/search.js';
import { bindDom, createAppTemplate } from './lib/template.js';

const DATA_URL = '/idiom.json';

document.querySelector('#app').innerHTML = createAppTemplate();

const dom = bindDom();
let idioms = [];
let indexes = null;
let aiImageDataUrl = '';
let aiRecognitionRunId = 0;
let aiDragDepth = 0;

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error || new Error('图片读取失败')));
    reader.readAsDataURL(file);
  });
}

function setAiStatus(message, isError = false) {
  dom.aiStatus.textContent = message;
  dom.aiStatus.classList.toggle('field-error', isError);
}

function focusAiRecognition() {
  const shouldScroll = !dom.aiCard.open || !dom.aiCard.classList.contains('ai-card-dragging');
  dom.aiCard.open = true;
  dom.aiCard.classList.add('ai-card-dragging');
  dom.aiDropZone.classList.add('ai-dropzone-active');
  dom.aiDropZone.focus({ preventScroll: true });
  if (shouldScroll) {
    dom.aiCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function clearAiDragFocus() {
  aiDragDepth = 0;
  dom.aiCard.classList.remove('ai-card-dragging');
  dom.aiDropZone.classList.remove('ai-dropzone-active');
}

function isImageTransfer(dataTransfer) {
  return Array.from(dataTransfer?.items || []).some((item) => item.kind === 'file' && item.type.startsWith('image/'));
}

function syncAiImageState() {
  dom.aiRecognizeButton.disabled = !aiImageDataUrl;
  dom.aiClearImageButton.disabled = !aiImageDataUrl;
  dom.aiImagePreview.hidden = !aiImageDataUrl;
  dom.aiDropZone.classList.toggle('ai-dropzone-ready', Boolean(aiImageDataUrl));
  if (aiImageDataUrl) {
    dom.aiImagePreview.src = aiImageDataUrl;
  } else {
    dom.aiImagePreview.removeAttribute('src');
  }
}

async function setAiImageFromFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    setAiStatus('请选择图片文件', true);
    return;
  }

  aiRecognitionRunId += 1;
  focusAiRecognition();
  aiImageDataUrl = await fileToDataUrl(file);
  setAiStatus(`图片已载入：${file.name || '剪贴板截图'}`);
  syncAiImageState();
  await recognizeCurrentAiImage();
}

async function setAiImageFromFileList(files) {
  const file = Array.from(files || []).find((item) => item.type.startsWith('image/'));
  if (!file) {
    setAiStatus('没有找到可用图片', true);
    return;
  }

  await setAiImageFromFile(file);
}

function joinParts(parts) {
  return Array.isArray(parts) ? parts.join(' ') : '';
}

function applyRecognitionFilters(filters) {
  dom.globalChars.value = filters.globalChars.join('');
  dom.globalLetters.value = filters.globalParts.join(' ');
  dom.globalExcludeChars.value = filters.globalExcludeChars.join('');

  filters.fixedChars.forEach((char, index) => {
    dom.fixedCharInputs[index].value = char;
  });

  syncPositionLocks();

  filters.tones.forEach((tone, index) => {
    if (!dom.toneInputs[index].disabled) dom.toneInputs[index].value = tone;
  });
  filters.positionParts.forEach((parts, index) => {
    if (!dom.positionInputs[index].disabled) dom.positionInputs[index].value = joinParts(parts);
  });
  filters.excludeTones.forEach((tone, index) => {
    if (!dom.excludeToneInputs[index].disabled) dom.excludeToneInputs[index].value = tone;
  });
  filters.excludeParts.forEach((parts, index) => {
    if (!dom.excludeInputs[index].disabled) dom.excludeInputs[index].value = joinParts(parts);
  });
  filters.excludeChars.forEach((char, index) => {
    if (!dom.excludeCharInputs[index].disabled) dom.excludeCharInputs[index].value = char;
  });

  syncPositionLocks();
  syncFilledInputs();
  refreshValidation();
  search();
}

async function recognizeCurrentAiImage() {
  if (!aiImageDataUrl) {
    return;
  }

  const runId = (aiRecognitionRunId += 1);
  dom.aiRecognizeButton.disabled = true;
  setAiStatus('正在识别截图...');

  try {
    const filters = await recognizeImageFilters(aiImageDataUrl);
    if (runId !== aiRecognitionRunId) {
      return;
    }

    applyRecognitionFilters(filters);
    setAiStatus(filters.notes ? `已回填：${filters.notes}` : '识别完成，已回填手动条件');
  } catch (error) {
    if (runId !== aiRecognitionRunId) {
      return;
    }

    console.error(error);
    setAiStatus(error.message || '识别失败，请检查接口配置和图片内容', true);
  } finally {
    if (runId === aiRecognitionRunId) {
      syncAiImageState();
    }
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

dom.aiDropZone.addEventListener('click', (event) => {
  if (event.target === dom.aiImageInput) {
    return;
  }

  dom.aiImageInput.click();
});

dom.aiDropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    dom.aiImageInput.click();
  }
});

document.addEventListener('dragenter', (event) => {
  if (!isImageTransfer(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  aiDragDepth += 1;
  focusAiRecognition();
});

document.addEventListener('dragover', (event) => {
  if (!isImageTransfer(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  focusAiRecognition();
});

document.addEventListener('dragleave', (event) => {
  if (!isImageTransfer(event.dataTransfer)) {
    return;
  }

  aiDragDepth = Math.max(0, aiDragDepth - 1);
  if (!aiDragDepth || (event.clientX === 0 && event.clientY === 0)) {
    clearAiDragFocus();
  }
});

document.addEventListener('drop', async (event) => {
  if (!isImageTransfer(event.dataTransfer)) {
    return;
  }

  event.preventDefault();
  clearAiDragFocus();
  try {
    await setAiImageFromFileList(event.dataTransfer?.files);
  } catch (error) {
    setAiStatus(error.message || '图片读取失败', true);
  }
});

document.addEventListener('paste', async (event) => {
  const target = event.target;
  const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (isEditable) {
    return;
  }

  const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith('image/'));
  if (!imageItem) {
    return;
  }

  event.preventDefault();
  try {
    await setAiImageFromFile(imageItem.getAsFile());
  } catch (error) {
    setAiStatus(error.message || '图片读取失败', true);
  }
});

dom.aiImageInput.addEventListener('change', async () => {
  try {
    await setAiImageFromFileList(dom.aiImageInput.files);
  } catch (error) {
    setAiStatus(error.message || '图片读取失败', true);
  } finally {
    dom.aiImageInput.value = '';
  }
});

dom.aiClearImageButton.addEventListener('click', () => {
  aiRecognitionRunId += 1;
  aiImageDataUrl = '';
  setAiStatus('等待截图');
  syncAiImageState();
});

dom.aiRecognizeButton.addEventListener('click', async () => {
  await recognizeCurrentAiImage();
});

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
syncAiImageState();

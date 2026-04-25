function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightSyllable(syllable, fragments) {
  const plain = syllable.plain;
  const rawDisplay = syllable.raw || syllable.plain;

  if (!fragments.length) {
    return escapeHtml(rawDisplay);
  }

  const ranges = [];
  fragments.forEach((fragment) => {
    let start = plain.indexOf(fragment);
    while (start !== -1) {
      ranges.push([start, start + fragment.length]);
      start = plain.indexOf(fragment, start + 1);
    }
  });

  if (!ranges.length) {
    return escapeHtml(rawDisplay);
  }

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const current of ranges) {
    const last = merged[merged.length - 1];
    if (!last || current[0] > last[1]) {
      merged.push([...current]);
    } else {
      last[1] = Math.max(last[1], current[1]);
    }
  }

  let html = '';
  let cursor = 0;
  merged.forEach(([start, end]) => {
    html += escapeHtml(rawDisplay.slice(cursor, start));
    html += `<mark>${escapeHtml(rawDisplay.slice(start, end))}</mark>`;
    cursor = end;
  });
  html += escapeHtml(rawDisplay.slice(cursor));

  return html;
}

export function renderResults(dom, idioms, items, filters, totalMatches = items.length) {
  dom.results.innerHTML = '';
  if (dom.resultCount) {
    dom.resultCount.textContent = `(${totalMatches.toLocaleString()}/${idioms.length.toLocaleString()})`;
  }

  if (!idioms.length) {
    dom.results.innerHTML = '<div class="loading-state">正在初始化词库，请稍候...</div>';
    return;
  }

  if (!filters.activeCount) {
    dom.results.innerHTML = '<div class="empty-state">请输入至少一个条件，系统会根据匹配字段数量排序显示候选成语。</div>';
    dom.stats.textContent = `词库已加载 ${idioms.length.toLocaleString()} 条成语，等待输入。`;
    return;
  }

  if (!items.length) {
    dom.results.innerHTML = '<div class="empty-state">没有找到匹配结果，建议放宽某些条件后再试。</div>';
    dom.stats.textContent = `当前启用 ${filters.activeCount} 个条件，没有候选结果。`;
    return;
  }

  const showMeaning = dom.showMeaningToggle?.checked;
  const fragment = document.createDocumentFragment();

  items.forEach(({ record, score, marks }) => {
    const node = dom.template.content.firstElementChild.cloneNode(true);
    const copyButton = node.querySelector('.copy-button');
    copyButton.dataset.word = record.word;
    copyButton.setAttribute('aria-label', `复制成语 ${record.word}`);
    copyButton.setAttribute('title', `复制 ${record.word}`);

    node.querySelector('.score-badge').textContent = `${score}/${filters.activeCount}`;
    node.querySelector('.abbreviation').textContent = record.abbreviation || 'CHENGYU';

    const meaning = node.querySelector('.meaning');
    if (showMeaning) {
      meaning.textContent = record.explanation || '暂无释义';
    } else {
      meaning.remove();
      node.classList.add('result-card-compact');
    }

    const grid = node.querySelector('.idiom-grid');
    const table = document.createElement('table');
    table.className = 'idiom-table';

    const pinyinRow = document.createElement('tr');
    pinyinRow.className = 'idiom-row idiom-row-pinyin';
    const hanziRow = document.createElement('tr');
    hanziRow.className = 'idiom-row idiom-row-hanzi';

    const copyCell = document.createElement('td');
    copyCell.className = 'copy-cell';
    copyCell.rowSpan = 2;
    const inlineCopyButton = copyButton.cloneNode(true);
    inlineCopyButton.classList.add('copy-button-inline');
    copyCell.appendChild(inlineCopyButton);
    pinyinRow.appendChild(copyCell);

    record.characters.forEach((char, index) => {
      const pinyinCell = document.createElement('td');
      pinyinCell.className = 'char-cell';
      const pinyin = document.createElement('div');
      pinyin.className = 'pinyin';
      pinyin.innerHTML = highlightSyllable(record.syllables[index], marks[index]);
      pinyinCell.appendChild(pinyin);
      pinyinRow.appendChild(pinyinCell);

      const hanziCell = document.createElement('td');
      hanziCell.className = 'char-cell';
      const hanzi = document.createElement('span');
      hanzi.className = 'hanzi';
      hanzi.textContent = char;
      hanziCell.appendChild(hanzi);
      hanziRow.appendChild(hanziCell);
    });

    table.append(pinyinRow, hanziRow);
    grid.appendChild(table);

    copyButton.remove();

    fragment.appendChild(node);
  });

  dom.results.appendChild(fragment);
  const topScore = items[0].score;
  dom.stats.textContent = `当前启用 ${filters.activeCount} 个条件，共找到 ${totalMatches.toLocaleString()} 条候选，当前展示前 ${items.length.toLocaleString()} 条，最高命中 ${topScore} 项。`;
}

export function renderLoadError(dom, error) {
  console.error(error);
  dom.results.innerHTML = '<div class="error-state">词库读取失败，请确认 `data/idiom.json` 存在且格式正确。</div>';
  dom.stats.textContent = '初始化失败';
}

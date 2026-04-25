function createPositionSlot(index) {
  return `
    <article class="slot-card">
      <div class="slot-card-head">
        <span class="slot-name">${index}</span>
        <input class="tone-chip" type="text" maxlength="1" inputmode="numeric" placeholder="调" aria-label="第${index}位声调" />
      </div>
      <label class="compact-field">
        <span class="field-title">字</span>
        <input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="汉字" aria-label="第${index}位包含汉字" />
      </label>
      <label class="compact-field">
        <span class="field-title">声韵</span>
        <input data-validate="parts" type="text" maxlength="24" inputmode="latin" autocomplete="off" spellcheck="false" placeholder="y ue" aria-label="第${index}位拼音包含声母韵母" />
        <span class="field-error"></span>
      </label>
    </article>
  `;
}

function createExcludeSlot(index) {
  return `
    <article class="slot-card slot-card-exclude">
      <div class="slot-card-head">
        <span class="slot-name">${index}</span>
        <input class="tone-chip tone-chip-exclude" type="text" maxlength="1" inputmode="numeric" placeholder="调" aria-label="第${index}位不包含声调" />
      </div>
      <label class="compact-field">
        <span class="field-title">排除的声母韵母</span>
        <input data-validate="parts" type="text" maxlength="24" inputmode="latin" autocomplete="off" spellcheck="false" placeholder="u ang" aria-label="第${index}位拼音不包含声母韵母" />
        <span class="field-error"></span>
      </label>
      <label class="compact-field">
        <span class="field-title">错位汉字</span>
        <input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="汉字" aria-label="第${index}位不包含汉字" />
      </label>
    </article>
  `;
}

export function createAppTemplate() {
  return `
    <div class="page-shell">
      <main class="layout">
        <section class="panel controls-panel">
          <div class="section-heading">
            <details class="reference-panel reference-panel-inline">
              <summary>推荐顺序 / 常用声母韵母</summary>
              <div class="guide-panel">
                <div class="guide-head">
                  <h3>推荐顺序</h3>
                  <span class="guide-badge">先强后弱</span>
                </div>
                <ol class="guide-list">
                  <li>先填“位置字”</li>
                  <li>再填“任意汉字”</li>
                  <li>再补“位置声调”</li>
                  <li>最后补“声母韵母”</li>
                </ol>
                <p class="guide-note">排除条件适合在候选还很多时再展开使用。</p>
              </div>

              <div class="reference-grid">
                <div>
                  <h4>声母</h4>
                  <p>b p m f d t n l g k h j q x zh ch sh r z c s y w</p>
                </div>
                <div>
                  <h4>韵母</h4>
                  <p>a o e ai ei ao ou an en ang eng er i ia ie iao iu ian in iang ing iong u ua uo uai ui uan un uang ong ue v ve van vn</p>
                </div>
              </div>
            </details>
            <button id="resetButton" class="ghost-button" type="button">清空条件</button>
          </div>

          <details id="aiCard" class="condition-card ai-card">
            <summary class="condition-card-head ai-card-summary">
              <h3>自动识别</h3>
              <p>点击、拖入或粘贴截图，自动回填下面的手动条件。</p>
            </summary>

            <div class="ai-recognition-row">
              <div
                id="aiDropZone"
                class="ai-dropzone"
                role="button"
                tabindex="0"
                aria-label="点击选择图片，拖入图片，或粘贴截图用于自动识别"
              >
                <input id="aiImageInput" class="ai-file-input" type="file" accept="image/*" />
                <img id="aiImagePreview" alt="待识别截图预览" hidden />
                <div class="ai-dropzone-copy">
                  <strong>放入截图</strong>
                  <span>点击选择图片、拖入图片，或聚焦后粘贴截图</span>
                </div>
                <span id="aiStatus" class="field-meta">等待截图</span>
              </div>

              <div class="ai-actions">
                <button id="aiRecognizeButton" class="ghost-button ai-primary-button" type="button" disabled>识别并回填</button>
                <button id="aiClearImageButton" class="ai-secondary-button" type="button" disabled>移除图片</button>
              </div>
            </div>
          </details>

          <div class="condition-cards">
            <section class="condition-card include-card">
              <div class="condition-card-head">
                <h3>包含</h3>
                <p>优先输入字和声调，过滤会更快。</p>
              </div>

              <div class="compact-row compact-row-double global-row">
                <label class="compact-field compact-field-wide priority-high">
                  <span class="field-title">任意汉字</span>
                  <input
                    id="globalChars"
                    name="globalChars"
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="8"
                    placeholder="山水"
                  />
                  <span class="field-meta" id="globalCharAppendHint">自动追加：无</span>
                </label>

                <label class="compact-field compact-field-wide priority-mid">
                  <span class="field-title">任意声韵</span>
                  <input
                    id="globalLetters"
                    data-validate="parts"
                    name="globalLetters"
                    type="text"
                    inputmode="latin"
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="24"
                    placeholder="y ue"
                  />
                  <span class="field-meta">空格分隔</span>
                  <span class="field-error" id="globalLettersError"></span>
                </label>
              </div>

              <div class="compact-row-title">位置条件 <span class="inline-hint">4 位一行，字已确定时其余条件自动失效</span></div>
              <div class="slot-grid include-slot-grid" id="positionSlots">
                ${[1, 2, 3, 4].map(createPositionSlot).join('')}
              </div>
            </section>

            <section class="condition-card exclude-card">
              <div class="condition-card-head">
                <h3>排除</h3>
                <p>保持常开，候选仍很多时再补充。</p>
              </div>

              <div class="compact-row compact-row-single global-row exclude-body-first">
                <label class="compact-field compact-field-wide">
                  <span class="field-title">任意排字</span>
                  <input
                    id="globalExcludeChars"
                    name="globalExcludeChars"
                    type="text"
                    inputmode="text"
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="8"
                    placeholder="风月"
                  />
                  <span class="field-meta">这些汉字在 4 个位置里都不能出现</span>
                </label>
              </div>

              <div class="compact-row-title">位置排除 <span class="inline-hint">用于快速剔除不可能项</span></div>
              <div class="slot-grid exclude-slot-grid" id="excludeSlots">
                ${[1, 2, 3, 4].map(createExcludeSlot).join('')}
              </div>
            </section>
          </div>

          <div class="stats" id="stats">正在读取词库...</div>
        </section>

        <section class="panel results-panel">
          <div class="section-heading results-heading">
            <h2>候选结果 <span id="resultCount" class="result-count">(0/0)</span></h2>
            <div class="results-toolbar">
              <label class="toggle-switch" for="showMeaningToggle">
                <input id="showMeaningToggle" type="checkbox" />
                <span class="toggle-track" aria-hidden="true"></span>
                <span class="toggle-label">显示释义</span>
              </label>
              <div class="legend">
                <span class="legend-dot"></span>
                <span>绿色表示命中的拼音片段</span>
              </div>
            </div>
          </div>
          <div id="results" class="results"></div>
        </section>
      </main>
    </div>

    <template id="resultTemplate">
      <article class="result-card">
        <div class="result-meta">
          <button class="copy-button" type="button" aria-label="复制成语" title="复制"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9h9v11H9z"></path><path d="M6 4h9v3H9v9H6z"></path></svg></button>
          <span class="score-badge"></span>
          <span class="abbreviation"></span>
        </div>
        <div class="idiom-grid"></div>
        <p class="meaning"></p>
      </article>
    </template>
  `;
}

export function bindDom() {
  const positionCards = Array.from(document.querySelectorAll('#positionSlots .slot-card'));
  const excludeCards = Array.from(document.querySelectorAll('#excludeSlots .slot-card'));

  return {
    globalLetters: document.getElementById('globalLetters'),
    globalChars: document.getElementById('globalChars'),
    globalExcludeChars: document.getElementById('globalExcludeChars'),
    globalCharAppendHint: document.getElementById('globalCharAppendHint'),
    aiCard: document.getElementById('aiCard'),
    aiDropZone: document.getElementById('aiDropZone'),
    aiImageInput: document.getElementById('aiImageInput'),
    aiRecognizeButton: document.getElementById('aiRecognizeButton'),
    aiClearImageButton: document.getElementById('aiClearImageButton'),
    aiImagePreview: document.getElementById('aiImagePreview'),
    aiStatus: document.getElementById('aiStatus'),
    positionCards,
    excludeCards,
    fixedCharInputs: positionCards.map((card) => card.querySelector('[aria-label$="包含汉字"]')),
    toneInputs: positionCards.map((card) => card.querySelector('.tone-chip')),
    positionInputs: positionCards.map((card) => card.querySelector('[aria-label$="包含声母韵母"]')),
    excludeToneInputs: excludeCards.map((card) => card.querySelector('.tone-chip-exclude')),
    excludeInputs: excludeCards.map((card) => card.querySelector('[aria-label$="不包含声母韵母"]')),
    excludeCharInputs: excludeCards.map((card) => card.querySelector('[aria-label$="不包含汉字"]')),
    resetButton: document.getElementById('resetButton'),
    showMeaningToggle: document.getElementById('showMeaningToggle'),
    stats: document.getElementById('stats'),
    resultCount: document.getElementById('resultCount'),
    results: document.getElementById('results'),
    template: document.getElementById('resultTemplate'),
  };
}

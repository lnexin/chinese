(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const ee=200,te=new Set(["b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w","a","o","e","ai","ei","ao","ou","an","en","ang","eng","er","i","ia","ie","iao","iu","ian","in","iang","ing","iong","u","ua","uo","uai","ui","uan","un","uang","ong","ue","ve","v","van","vn"]),S=e=>e.replace(/[^0-4]/g,"").slice(0,1),T=e=>(e.match(/[\p{Script=Han}]/gu)||[]).at(-1)||"",P=e=>e.match(/[\p{Script=Han}]/gu)||[],C=e=>e.toLowerCase().trim().split(/\s+/).map(t=>t.replace(/[^a-z]/g,"")).filter(Boolean);function ae(e){return C(e).filter(t=>!te.has(t))}function ne(e){if(!e.length)return null;const t=e.map(n=>Array.from(new Set(n))).sort((n,s)=>n.length-s.length);let a=new Set(t[0]);for(let n=1;n<t.length;n+=1){const s=new Set(t[n]);if(a=new Set(Array.from(a).filter(o=>s.has(o))),!a.size)break}return Array.from(a)}function se(e,t){return t.every(a=>e.parts.includes(a))}function le(e){const t=new Map,a=new Map,n=Array.from({length:4},()=>new Map),s=Array.from({length:4},()=>new Map),o=Array.from({length:4},()=>new Map);return e.forEach((c,r)=>{const u=new Set,d=new Set;c.syllables.forEach((g,h)=>{const p=c.characters[h];o[h].has(p)||o[h].set(p,[]),o[h].get(p).push(r),d.has(p)||(a.has(p)||a.set(p,[]),a.get(p).push(r),d.add(p)),g.parts.forEach(i=>{n[h].has(i)||n[h].set(i,[]),n[h].get(i).push(r),u.has(i)||(t.has(i)||t.set(i,[]),t.get(i).push(r),u.add(i))}),s[h].has(g.tone)||s[h].set(g.tone,[]),s[h].get(g.tone).push(r)})}),{globalPart:t,globalChar:a,positionPart:n,tone:s,fixedChar:o}}function U(e){const t=C(e.globalLetters.value),a=P(e.globalChars.value),n=P(e.globalExcludeChars.value),s=e.fixedCharInputs.map(i=>T(i.value)),o=e.toneInputs.map(i=>(i.value=S(i.value),i.value)),c=e.positionInputs.map(i=>C(i.value)),r=e.excludeToneInputs.map(i=>(i.value=S(i.value),i.value)),u=e.excludeInputs.map(i=>C(i.value)),d=e.excludeCharInputs.map(i=>T(i.value)),g=Array.from(new Set(d.filter(Boolean))),h=Array.from(new Set([...a,...g]));e.globalCharAppendHint&&(e.globalCharAppendHint.textContent=g.length?`自动追加：${g.join(" ")}`:"自动追加：无");let p=+(t.length>0)+ +(a.length>0)+ +(n.length>0);for(let i=0;i<4;i+=1){if(s[i]){p+=1;continue}o[i]&&(p+=1),c[i].length&&(p+=1),r[i]&&(p+=1),u[i].length&&(p+=1),d[i]&&(p+=1)}return{globalParts:t,rawGlobalChars:a,globalExcludeChars:n,effectiveGlobalChars:h,fixedChars:s,tones:o,positionParts:c,excludeTones:r,excludeParts:u,excludeChars:d,activeCount:p}}function oe(e,t){const a=[];return e.fixedChars.forEach((n,s)=>{n&&a.push(t.fixedChar[s].get(n)||[])}),e.tones.forEach((n,s)=>{!e.fixedChars[s]&&n&&a.push(t.tone[s].get(n)||[])}),e.positionParts.forEach((n,s)=>{e.fixedChars[s]||n.forEach(o=>{a.push(t.positionPart[s].get(o)||[])})}),e.effectiveGlobalChars.forEach(n=>{a.push(t.globalChar.get(n)||[])}),e.globalParts.forEach(n=>{a.push(t.globalPart.get(n)||[])}),a}function re(e,t){if(t.globalExcludeChars.length&&t.globalExcludeChars.some(a=>e.characters.includes(a)))return!1;for(let a=0;a<4;a+=1){if(t.fixedChars[a])continue;const n=t.excludeTones[a];if(n&&e.syllables[a]?.tone===n)return!1;const s=t.excludeParts[a];if(s.length&&s.some(c=>e.syllables[a]?.parts.includes(c)))return!1;const o=t.excludeChars[a];if(o&&(e.characters[a]===o||!e.characters.some((r,u)=>u!==a&&r===o)))return!1}return!0}function ie(e,t,a){const n=oe(e,a),o=ne(n)??t.map((c,r)=>r);return!e.globalExcludeChars.length&&!e.excludeTones.some(Boolean)&&!e.excludeParts.some(c=>c.length)&&!e.excludeChars.some(Boolean)?o:o.filter(c=>re(t[c],e))}function ce(e,t){let a=0;const n=[[],[],[],[]];if(t.globalParts.length){if(!t.globalParts.every(o=>e.joinedParts.includes(o)))return{score:-1,marks:n};a+=1,e.syllables.forEach((o,c)=>{t.globalParts.forEach(r=>{o.parts.includes(r)&&n[c].push(r)})})}if(t.rawGlobalChars.length){if(!t.rawGlobalChars.every(o=>e.characters.includes(o)))return{score:-1,marks:n};a+=1}if(t.globalExcludeChars.length){if(t.globalExcludeChars.some(s=>e.characters.includes(s)))return{score:-1,marks:n};a+=1}for(let s=0;s<4;s+=1){const o=t.fixedChars[s];if(o){if(e.characters[s]!==o)return{score:-1,marks:n};a+=1;continue}const c=t.tones[s];if(c){if(e.syllables[s]?.tone!==c)return{score:-1,marks:n};a+=1}const r=t.positionParts[s];if(r.length){if(!se(e.syllables[s],r))return{score:-1,marks:n};a+=1,n[s].push(...r)}const u=t.excludeTones[s];if(u){if(e.syllables[s]?.tone===u)return{score:-1,marks:n};a+=1}const d=t.excludeParts[s];if(d.length){if(d.some(h=>e.syllables[s]?.parts.includes(h)))return{score:-1,marks:n};a+=1}const g=t.excludeChars[s];if(g){if(e.characters[s]===g)return{score:-1,marks:n};if(!e.characters.some((p,i)=>i!==s&&p===g))return{score:-1,marks:n};a+=1}}return{score:a,marks:n}}function ue(e,t,a){return e.map(n=>{const s=t[n],o=ce(s,a);return{record:s,...o}}).filter(n=>n.score>0).sort((n,s)=>s.score!==n.score?s.score-n.score:n.record.word.localeCompare(s.record.word,"zh-Hans-CN"))}const de=4;function y(e,t){return Array.from({length:de},(a,n)=>t(Array.isArray(e)?e[n]:"",n))}function R(e){return Array.isArray(e)?C(e.join(" ")):C(String(e||""))}function pe(e){const t=y(e.fixedChars,T);return{globalChars:Array.from(new Set(P((e.globalChars||[]).join?.("")??e.globalChars))),globalParts:Array.from(new Set(R(e.globalParts))),globalExcludeChars:Array.from(new Set(P((e.globalExcludeChars||[]).join?.("")??e.globalExcludeChars))),fixedChars:t,tones:y(e.tones,(a,n)=>t[n]?"":S(String(a||""))),positionParts:y(e.positionParts,(a,n)=>t[n]?[]:R(a)),excludeTones:y(e.excludeTones,(a,n)=>t[n]?"":S(String(a||""))),excludeParts:y(e.excludeParts,(a,n)=>t[n]?[]:R(a)),excludeChars:y(e.excludeChars,(a,n)=>t[n]?"":T(String(a||""))),notes:String(e.notes||"").trim()}}async function he(e){const t=await fetch("/api/recognize",{method:"POST",headers:{accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({imageDataUrl:e})});if(!t.ok){const n=await t.json().catch(()=>({}));throw new Error(n.error||`识别接口请求失败：HTTP ${t.status}`)}const a=await t.json();return pe(a.conditions||a)}const ge=["zh","ch","sh","b","p","m","f","d","t","n","l","g","k","h","j","q","x","r","z","c","s","y","w"];function fe(e){const t=ge.find(n=>e.startsWith(n))||"",a=e.slice(t.length);return{initial:t,final:a}}function me(e){const t=e.trim();if(!t)return{raw:"",plain:"",tone:"0",initial:"",final:"",parts:[]};let a="0",n="";for(const r of t.normalize("NFD"))if(!new RegExp("\\p{Mark}","u").test(r)){if(r==="ü"||r==="ǖ"||r==="ǘ"||r==="ǚ"||r==="ǜ"){n+="u",r!=="ü"&&(a=String("ǖǘǚǜ".indexOf(r)+1));continue}n+=r.toLowerCase()}for(const r of[["ā","á","ǎ","à"],["ē","é","ě","è"],["ī","í","ǐ","ì"],["ō","ó","ǒ","ò"],["ū","ú","ǔ","ù"],["ǖ","ǘ","ǚ","ǜ"]])for(let u=0;u<r.length;u+=1)t.includes(r[u])&&(a=String(u+1));n=n.replace(/[^a-z]/g,"");const{initial:s,final:o}=fe(n),c=[s,o].filter(Boolean);return{raw:t,plain:n,tone:a,initial:s,final:o,parts:c}}function be(e){return e.trim().split(/\s+/).map(me).slice(0,4)}function ye(e){return e.filter(t=>typeof t.word=="string"&&t.word.length===4&&typeof t.pinyin=="string").map(t=>{const a=be(t.pinyin);return a.length!==4?null:{...t,characters:Array.from(t.word),syllables:a,joinedParts:a.flatMap(n=>n.parts)}}).filter(Boolean)}function x(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ve(e,t){const a=e.plain,n=e.raw||e.plain;if(!t.length)return x(n);const s=[];if(t.forEach(u=>{let d=a.indexOf(u);for(;d!==-1;)s.push([d,d+u.length]),d=a.indexOf(u,d+1)}),!s.length)return x(n);s.sort((u,d)=>u[0]-d[0]);const o=[];for(const u of s){const d=o[o.length-1];!d||u[0]>d[1]?o.push([...u]):d[1]=Math.max(d[1],u[1])}let c="",r=0;return o.forEach(([u,d])=>{c+=x(n.slice(r,u)),c+=`<mark>${x(n.slice(u,d))}</mark>`,r=d}),c+=x(n.slice(r)),c}function _(e,t,a,n,s=a.length){if(e.results.innerHTML="",e.resultCount&&(e.resultCount.textContent=`(${s.toLocaleString()}/${t.length.toLocaleString()})`),!t.length){e.results.innerHTML='<div class="loading-state">正在初始化词库，请稍候...</div>';return}if(!n.activeCount){e.results.innerHTML='<div class="empty-state">请输入至少一个条件，系统会根据匹配字段数量排序显示候选成语。</div>',e.stats.textContent=`词库已加载 ${t.length.toLocaleString()} 条成语，等待输入。`;return}if(!a.length){e.results.innerHTML='<div class="empty-state">没有找到匹配结果，建议放宽某些条件后再试。</div>',e.stats.textContent=`当前启用 ${n.activeCount} 个条件，没有候选结果。`;return}const o=e.showMeaningToggle?.checked,c=document.createDocumentFragment();a.forEach(({record:u,score:d,marks:g})=>{const h=e.template.content.firstElementChild.cloneNode(!0),p=h.querySelector(".copy-button");p.dataset.word=u.word,p.setAttribute("aria-label",`复制成语 ${u.word}`),p.setAttribute("title",`复制 ${u.word}`),h.querySelector(".score-badge").textContent=`${d}/${n.activeCount}`,h.querySelector(".abbreviation").textContent=u.abbreviation||"CHENGYU";const i=h.querySelector(".meaning");o?i.textContent=u.explanation||"暂无释义":(i.remove(),h.classList.add("result-card-compact"));const K=h.querySelector(".idiom-grid"),M=document.createElement("table");M.className="idiom-table";const w=document.createElement("tr");w.className="idiom-row idiom-row-pinyin";const H=document.createElement("tr");H.className="idiom-row idiom-row-hanzi";const L=document.createElement("td");L.className="copy-cell",L.rowSpan=2;const O=p.cloneNode(!0);O.classList.add("copy-button-inline"),L.appendChild(O),w.appendChild(L),u.characters.forEach((Q,G)=>{const D=document.createElement("td");D.className="char-cell";const j=document.createElement("div");j.className="pinyin",j.innerHTML=ve(u.syllables[G],g[G]),D.appendChild(j),w.appendChild(D);const N=document.createElement("td");N.className="char-cell";const q=document.createElement("span");q.className="hanzi",q.textContent=Q,N.appendChild(q),H.appendChild(N)}),M.append(w,H),K.appendChild(M),p.remove(),c.appendChild(h)}),e.results.appendChild(c);const r=a[0].score;e.stats.textContent=`当前启用 ${n.activeCount} 个条件，共找到 ${s.toLocaleString()} 条候选，当前展示前 ${a.length.toLocaleString()} 条，最高命中 ${r} 项。`}function Ce(e,t){console.error(t),e.results.innerHTML='<div class="error-state">词库读取失败，请确认 `data/idiom.json` 存在且格式正确。</div>',e.stats.textContent="初始化失败"}function xe(e){return`
    <article class="slot-card">
      <div class="slot-card-head">
        <span class="slot-name">${e}</span>
        <input class="tone-chip" type="text" maxlength="1" inputmode="numeric" placeholder="调" aria-label="第${e}位声调" />
      </div>
      <label class="compact-field">
        <span class="field-title">字</span>
        <input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="汉字" aria-label="第${e}位包含汉字" />
      </label>
      <label class="compact-field">
        <span class="field-title">声韵</span>
        <input data-validate="parts" type="text" maxlength="24" inputmode="latin" autocomplete="off" spellcheck="false" placeholder="y ue" aria-label="第${e}位拼音包含声母韵母" />
        <span class="field-error"></span>
      </label>
    </article>
  `}function Ee(e){return`
    <article class="slot-card slot-card-exclude">
      <div class="slot-card-head">
        <span class="slot-name">${e}</span>
        <input class="tone-chip tone-chip-exclude" type="text" maxlength="1" inputmode="numeric" placeholder="调" aria-label="第${e}位不包含声调" />
      </div>
      <label class="compact-field">
        <span class="field-title">排除的声母韵母</span>
        <input data-validate="parts" type="text" maxlength="24" inputmode="latin" autocomplete="off" spellcheck="false" placeholder="u ang" aria-label="第${e}位拼音不包含声母韵母" />
        <span class="field-error"></span>
      </label>
      <label class="compact-field">
        <span class="field-title">错位汉字</span>
        <input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="汉字" aria-label="第${e}位不包含汉字" />
      </label>
    </article>
  `}function Ie(){return`
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
                ${[1,2,3,4].map(xe).join("")}
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
                ${[1,2,3,4].map(Ee).join("")}
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
  `}function we(){const e=Array.from(document.querySelectorAll("#positionSlots .slot-card")),t=Array.from(document.querySelectorAll("#excludeSlots .slot-card"));return{globalLetters:document.getElementById("globalLetters"),globalChars:document.getElementById("globalChars"),globalExcludeChars:document.getElementById("globalExcludeChars"),globalCharAppendHint:document.getElementById("globalCharAppendHint"),aiCard:document.getElementById("aiCard"),aiDropZone:document.getElementById("aiDropZone"),aiImageInput:document.getElementById("aiImageInput"),aiRecognizeButton:document.getElementById("aiRecognizeButton"),aiClearImageButton:document.getElementById("aiClearImageButton"),aiImagePreview:document.getElementById("aiImagePreview"),aiStatus:document.getElementById("aiStatus"),positionCards:e,excludeCards:t,fixedCharInputs:e.map(a=>a.querySelector('[aria-label$="包含汉字"]')),toneInputs:e.map(a=>a.querySelector(".tone-chip")),positionInputs:e.map(a=>a.querySelector('[aria-label$="包含声母韵母"]')),excludeToneInputs:t.map(a=>a.querySelector(".tone-chip-exclude")),excludeInputs:t.map(a=>a.querySelector('[aria-label$="不包含声母韵母"]')),excludeCharInputs:t.map(a=>a.querySelector('[aria-label$="不包含汉字"]')),resetButton:document.getElementById("resetButton"),showMeaningToggle:document.getElementById("showMeaningToggle"),stats:document.getElementById("stats"),resultCount:document.getElementById("resultCount"),results:document.getElementById("results"),template:document.getElementById("resultTemplate")}}const Le="/idiom.json";document.querySelector("#app").innerHTML=Ie();const l=we();let b=[],W=null,f="",v=0,E=0;const Se=(e,t=120)=>{let a=0;return(...n)=>{window.clearTimeout(a),a=window.setTimeout(()=>e(...n),t)}};async function Te(e){try{return await navigator.clipboard.writeText(e),!0}catch(t){const a=document.createElement("textarea");a.value=e,a.setAttribute("readonly",""),a.style.position="absolute",a.style.left="-9999px",document.body.appendChild(a),a.select();const n=document.execCommand("copy");return a.remove(),n||console.error(t),n}}function Pe(e){return new Promise((t,a)=>{const n=new FileReader;n.addEventListener("load",()=>t(n.result)),n.addEventListener("error",()=>a(n.error||new Error("图片读取失败"))),n.readAsDataURL(e)})}function m(e,t=!1){l.aiStatus.textContent=e,l.aiStatus.classList.toggle("field-error",t)}function F(){const e=!l.aiCard.open||!l.aiCard.classList.contains("ai-card-dragging");l.aiCard.open=!0,l.aiCard.classList.add("ai-card-dragging"),l.aiDropZone.classList.add("ai-dropzone-active"),l.aiDropZone.focus({preventScroll:!0}),e&&l.aiCard.scrollIntoView({block:"nearest",behavior:"smooth"})}function V(){E=0,l.aiCard.classList.remove("ai-card-dragging"),l.aiDropZone.classList.remove("ai-dropzone-active")}function A(e){return Array.from(e?.items||[]).some(t=>t.kind==="file"&&t.type.startsWith("image/"))}function z(){l.aiRecognizeButton.disabled=!f,l.aiClearImageButton.disabled=!f,l.aiImagePreview.hidden=!f,l.aiDropZone.classList.toggle("ai-dropzone-ready",!!f),f?l.aiImagePreview.src=f:l.aiImagePreview.removeAttribute("src")}async function X(e){if(e){if(!e.type.startsWith("image/")){m("请选择图片文件",!0);return}v+=1,F(),f=await Pe(e),m(`图片已载入：${e.name||"剪贴板截图"}`),z(),await J()}}async function Y(e){const t=Array.from(e||[]).find(a=>a.type.startsWith("image/"));if(!t){m("没有找到可用图片",!0);return}await X(t)}function Z(e){return Array.isArray(e)?e.join(" "):""}function Ae(e){l.globalChars.value=e.globalChars.join(""),l.globalLetters.value=e.globalParts.join(" "),l.globalExcludeChars.value=e.globalExcludeChars.join(""),e.fixedChars.forEach((t,a)=>{l.fixedCharInputs[a].value=t}),I(),e.tones.forEach((t,a)=>{l.toneInputs[a].disabled||(l.toneInputs[a].value=t)}),e.positionParts.forEach((t,a)=>{l.positionInputs[a].disabled||(l.positionInputs[a].value=Z(t))}),e.excludeTones.forEach((t,a)=>{l.excludeToneInputs[a].disabled||(l.excludeToneInputs[a].value=t)}),e.excludeParts.forEach((t,a)=>{l.excludeInputs[a].disabled||(l.excludeInputs[a].value=Z(t))}),e.excludeChars.forEach((t,a)=>{l.excludeCharInputs[a].disabled||(l.excludeCharInputs[a].value=t)}),I(),k(),B(),$()}async function J(){if(!f)return;const e=v+=1;l.aiRecognizeButton.disabled=!0,m("正在识别截图...");try{const t=await he(f);if(e!==v)return;Ae(t),m(t.notes?`已回填：${t.notes}`:"识别完成，已回填手动条件")}catch(t){if(e!==v)return;console.error(t),m(t.message||"识别失败，请检查接口配置和图片内容",!0)}finally{e===v&&z()}}function ze(e){if(!e.dataset.validate)return;const t=ae(e.value),a=e.parentElement?.querySelector(".field-error");if(e.classList.toggle("input-invalid",t.length>0&&!e.disabled),t.length&&!e.disabled){const n=`可能不合法: ${t.join(", ")}`;e.title=`可能不是合法声母/韵母: ${t.join(", ")}`,a&&(a.textContent=n)}else e.removeAttribute("title"),a&&(a.textContent="")}function I(){l.fixedCharInputs.forEach((e,t)=>{const a=!!e.value.trim(),n=l.positionCards[t],s=l.excludeCards[t],o=[l.toneInputs[t],l.positionInputs[t],l.excludeToneInputs[t],l.excludeInputs[t],l.excludeCharInputs[t]];n.classList.toggle("slot-card-locked",a),s.classList.toggle("slot-card-locked",a),o.forEach(c=>{a&&(c.value=""),c.disabled=a,c.classList.toggle("is-disabled",a)})})}function B(){document.querySelectorAll('[data-validate="parts"]').forEach(e=>ze(e))}function k(){document.querySelectorAll("input").forEach(e=>{e.classList.toggle("input-filled",!!e.value.trim())})}function $(){const e=U(l),t=ie(e,b,W),a=ue(t,b,e);_(l,b,a.slice(0,ee),e,a.length)}async function Be(){try{const e=await fetch(Le);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();b=ye(t),W=le(b),l.stats.textContent=`词库读取完成，共 ${b.length.toLocaleString()} 条四字成语。`,I(),k(),B(),_(l,b,[],U(l))}catch(e){Ce(l,e)}}const ke=Se(()=>{I(),k(),B(),$()},80);[l.globalLetters,l.globalChars,l.globalExcludeChars,...l.fixedCharInputs,...l.toneInputs,...l.positionInputs,...l.excludeToneInputs,...l.excludeInputs,...l.excludeCharInputs].forEach(e=>{e.addEventListener("input",ke)});l.showMeaningToggle.addEventListener("change",$);l.aiDropZone.addEventListener("click",e=>{e.target!==l.aiImageInput&&l.aiImageInput.click()});l.aiDropZone.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),l.aiImageInput.click())});document.addEventListener("dragenter",e=>{A(e.dataTransfer)&&(e.preventDefault(),E+=1,F())});document.addEventListener("dragover",e=>{A(e.dataTransfer)&&(e.preventDefault(),e.dataTransfer.dropEffect="copy",F())});document.addEventListener("dragleave",e=>{A(e.dataTransfer)&&(E=Math.max(0,E-1),(!E||e.clientX===0&&e.clientY===0)&&V())});document.addEventListener("drop",async e=>{if(A(e.dataTransfer)){e.preventDefault(),V();try{await Y(e.dataTransfer?.files)}catch(t){m(t.message||"图片读取失败",!0)}}});document.addEventListener("paste",async e=>{const t=e.target;if(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t?.isContentEditable)return;const n=Array.from(e.clipboardData?.items||[]).find(s=>s.type.startsWith("image/"));if(n){e.preventDefault();try{await X(n.getAsFile())}catch(s){m(s.message||"图片读取失败",!0)}}});l.aiImageInput.addEventListener("change",async()=>{try{await Y(l.aiImageInput.files)}catch(e){m(e.message||"图片读取失败",!0)}finally{l.aiImageInput.value=""}});l.aiClearImageButton.addEventListener("click",()=>{v+=1,f="",m("等待截图"),z()});l.aiRecognizeButton.addEventListener("click",async()=>{await J()});l.results.addEventListener("click",async e=>{const t=e.target.closest(".copy-button");if(!t)return;const a=await Te(t.dataset.word||""),n=t.innerHTML,s=t.title;t.innerHTML=a?'<span class="copy-feedback">✓</span>':'<span class="copy-feedback">!</span>',t.title=a?"已复制":"复制失败",window.setTimeout(()=>{t.innerHTML=n,t.title=s},1200)});l.resetButton.addEventListener("click",()=>{l.globalLetters.value="",l.globalChars.value="",l.globalExcludeChars.value="",l.fixedCharInputs.forEach(e=>{e.value=""}),l.toneInputs.forEach(e=>{e.value=""}),l.positionInputs.forEach(e=>{e.value=""}),l.excludeToneInputs.forEach(e=>{e.value=""}),l.excludeInputs.forEach(e=>{e.value=""}),l.excludeCharInputs.forEach(e=>{e.value=""}),I(),k(),B(),$(),l.globalLetters.focus()});Be();z();

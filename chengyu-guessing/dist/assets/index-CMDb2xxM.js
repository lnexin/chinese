(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function a(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(s){if(s.ep)return;s.ep=!0;const l=a(s);fetch(s.href,l)}})();const G=["zh","ch","sh","b","p","m","f","d","t","n","l","g","k","h","j","q","x","r","z","c","s","y","w"];function O(e){const t=G.find(n=>e.startsWith(n))||"",a=e.slice(t.length);return{initial:t,final:a}}function F(e){const t=e.trim();if(!t)return{raw:"",plain:"",tone:"0",initial:"",final:"",parts:[]};let a="0",n="";for(const o of t.normalize("NFD"))if(!new RegExp("\\p{Mark}","u").test(o)){if(o==="ü"||o==="ǖ"||o==="ǘ"||o==="ǚ"||o==="ǜ"){n+="u",o!=="ü"&&(a=String("ǖǘǚǜ".indexOf(o)+1));continue}n+=o.toLowerCase()}for(const o of[["ā","á","ǎ","à"],["ē","é","ě","è"],["ī","í","ǐ","ì"],["ō","ó","ǒ","ò"],["ū","ú","ǔ","ù"],["ǖ","ǘ","ǚ","ǜ"]])for(let i=0;i<o.length;i+=1)t.includes(o[i])&&(a=String(i+1));n=n.replace(/[^a-z]/g,"");const{initial:s,final:l}=O(n),c=[s,l].filter(Boolean);return{raw:t,plain:n,tone:a,initial:s,final:l,parts:c}}function D(e){return e.trim().split(/\s+/).map(F).slice(0,4)}function R(e){return e.filter(t=>typeof t.word=="string"&&t.word.length===4&&typeof t.pinyin=="string").map(t=>{const a=D(t.pinyin);return a.length!==4?null:{...t,characters:Array.from(t.word),syllables:a,joinedParts:a.flatMap(n=>n.parts)}}).filter(Boolean)}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function _(e,t){const a=e.plain,n=e.raw||e.plain;if(!t.length)return m(n);const s=[];if(t.forEach(i=>{let d=a.indexOf(i);for(;d!==-1;)s.push([d,d+i.length]),d=a.indexOf(i,d+1)}),!s.length)return m(n);s.sort((i,d)=>i[0]-d[0]);const l=[];for(const i of s){const d=l[l.length-1];!d||i[0]>d[1]?l.push([...i]):d[1]=Math.max(d[1],i[1])}let c="",o=0;return l.forEach(([i,d])=>{c+=m(n.slice(o,i)),c+=`<mark>${m(n.slice(i,d))}</mark>`,o=d}),c+=m(n.slice(o)),c}function k(e,t,a,n,s=a.length){if(e.results.innerHTML="",e.resultCount&&(e.resultCount.textContent=`(${s.toLocaleString()}/${t.length.toLocaleString()})`),!t.length){e.results.innerHTML='<div class="loading-state">正在初始化词库，请稍候...</div>';return}if(!n.activeCount){e.results.innerHTML='<div class="empty-state">请输入至少一个条件，系统会根据匹配字段数量排序显示候选成语。</div>',e.stats.textContent=`词库已加载 ${t.length.toLocaleString()} 条成语，等待输入。`;return}if(!a.length){e.results.innerHTML='<div class="empty-state">没有找到匹配结果，建议放宽某些条件后再试。</div>',e.stats.textContent=`当前启用 ${n.activeCount} 个条件，没有候选结果。`;return}const l=e.showMeaningToggle?.checked,c=document.createDocumentFragment();a.forEach(({record:i,score:d,marks:f})=>{const h=e.template.content.firstElementChild.cloneNode(!0),p=h.querySelector(".copy-button");p.dataset.word=i.word,p.setAttribute("aria-label",`复制成语 ${i.word}`),p.setAttribute("title",`复制 ${i.word}`),h.querySelector(".score-badge").textContent=`${d}/${n.activeCount}`,h.querySelector(".abbreviation").textContent=i.abbreviation||"CHENGYU";const r=h.querySelector(".meaning");l?r.textContent=i.explanation||"暂无释义":(r.remove(),h.classList.add("result-card-compact"));const q=h.querySelector(".idiom-grid"),C=document.createElement("table");C.className="idiom-table";const b=document.createElement("tr");b.className="idiom-row idiom-row-pinyin";const x=document.createElement("tr");x.className="idiom-row idiom-row-hanzi";const v=document.createElement("td");v.className="copy-cell",v.rowSpan=2;const $=p.cloneNode(!0);$.classList.add("copy-button-inline"),v.appendChild($),b.appendChild(v),i.characters.forEach((j,A)=>{const w=document.createElement("td");w.className="char-cell";const E=document.createElement("div");E.className="pinyin",E.innerHTML=_(i.syllables[A],f[A]),w.appendChild(E),b.appendChild(w);const I=document.createElement("td");I.className="char-cell";const S=document.createElement("span");S.className="hanzi",S.textContent=j,I.appendChild(S),x.appendChild(I)}),C.append(b,x),q.appendChild(C),p.remove(),c.appendChild(h)}),e.results.appendChild(c);const o=a[0].score;e.stats.textContent=`当前启用 ${n.activeCount} 个条件，共找到 ${s.toLocaleString()} 条候选，当前展示前 ${a.length.toLocaleString()} 条，最高命中 ${o} 项。`}function U(e,t){console.error(t),e.results.innerHTML='<div class="error-state">词库读取失败，请确认 `data/idiom.json` 存在且格式正确。</div>',e.stats.textContent="初始化失败"}const V=200,K=new Set(["b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w","a","o","e","ai","ei","ao","ou","an","en","ang","eng","er","i","ia","ie","iao","iu","ian","in","iang","ing","iong","u","ua","uo","uai","ui","uan","un","uang","ong","ue","ve","v","van","vn"]),M=e=>e.replace(/[^0-4]/g,"").slice(0,1),z=e=>(e.match(/[\p{Script=Han}]/gu)||[]).at(-1)||"",H=e=>e.match(/[\p{Script=Han}]/gu)||[],y=e=>e.toLowerCase().trim().split(/\s+/).map(t=>t.replace(/[^a-z]/g,"")).filter(Boolean);function W(e){return y(e).filter(t=>!K.has(t))}function X(e){if(!e.length)return null;const t=e.map(n=>Array.from(new Set(n))).sort((n,s)=>n.length-s.length);let a=new Set(t[0]);for(let n=1;n<t.length;n+=1){const s=new Set(t[n]);if(a=new Set(Array.from(a).filter(l=>s.has(l))),!a.size)break}return Array.from(a)}function Y(e,t){return t.every(a=>e.parts.includes(a))}function J(e){const t=new Map,a=new Map,n=Array.from({length:4},()=>new Map),s=Array.from({length:4},()=>new Map),l=Array.from({length:4},()=>new Map);return e.forEach((c,o)=>{const i=new Set,d=new Set;c.syllables.forEach((f,h)=>{const p=c.characters[h];l[h].has(p)||l[h].set(p,[]),l[h].get(p).push(o),d.has(p)||(a.has(p)||a.set(p,[]),a.get(p).push(o),d.add(p)),f.parts.forEach(r=>{n[h].has(r)||n[h].set(r,[]),n[h].get(r).push(o),i.has(r)||(t.has(r)||t.set(r,[]),t.get(r).push(o),i.add(r))}),s[h].has(f.tone)||s[h].set(f.tone,[]),s[h].get(f.tone).push(o)})}),{globalPart:t,globalChar:a,positionPart:n,tone:s,fixedChar:l}}function B(e){const t=y(e.globalLetters.value),a=H(e.globalChars.value),n=H(e.globalExcludeChars.value),s=e.fixedCharInputs.map(r=>z(r.value)),l=e.toneInputs.map(r=>(r.value=M(r.value),r.value)),c=e.positionInputs.map(r=>y(r.value)),o=e.excludeToneInputs.map(r=>(r.value=M(r.value),r.value)),i=e.excludeInputs.map(r=>y(r.value)),d=e.excludeCharInputs.map(r=>z(r.value)),f=Array.from(new Set(d.filter(Boolean))),h=Array.from(new Set([...a,...f]));e.globalCharAppendHint&&(e.globalCharAppendHint.textContent=f.length?`自动追加：${f.join(" ")}`:"自动追加：无");let p=+(t.length>0)+ +(a.length>0)+ +(n.length>0);for(let r=0;r<4;r+=1){if(s[r]){p+=1;continue}l[r]&&(p+=1),c[r].length&&(p+=1),o[r]&&(p+=1),i[r].length&&(p+=1),d[r]&&(p+=1)}return{globalParts:t,rawGlobalChars:a,globalExcludeChars:n,effectiveGlobalChars:h,fixedChars:s,tones:l,positionParts:c,excludeTones:o,excludeParts:i,excludeChars:d,activeCount:p}}function Q(e,t){const a=[];return e.fixedChars.forEach((n,s)=>{n&&a.push(t.fixedChar[s].get(n)||[])}),e.tones.forEach((n,s)=>{!e.fixedChars[s]&&n&&a.push(t.tone[s].get(n)||[])}),e.positionParts.forEach((n,s)=>{e.fixedChars[s]||n.forEach(l=>{a.push(t.positionPart[s].get(l)||[])})}),e.effectiveGlobalChars.forEach(n=>{a.push(t.globalChar.get(n)||[])}),e.globalParts.forEach(n=>{a.push(t.globalPart.get(n)||[])}),a}function Z(e,t){if(t.globalExcludeChars.length&&t.globalExcludeChars.some(a=>e.characters.includes(a)))return!1;for(let a=0;a<4;a+=1){if(t.fixedChars[a])continue;const n=t.excludeTones[a];if(n&&e.syllables[a]?.tone===n)return!1;const s=t.excludeParts[a];if(s.length&&s.some(c=>e.syllables[a]?.parts.includes(c)))return!1;const l=t.excludeChars[a];if(l&&(e.characters[a]===l||!e.characters.some((o,i)=>i!==a&&o===l)))return!1}return!0}function ee(e,t,a){const n=Q(e,a),l=X(n)??t.map((c,o)=>o);return!e.globalExcludeChars.length&&!e.excludeTones.some(Boolean)&&!e.excludeParts.some(c=>c.length)&&!e.excludeChars.some(Boolean)?l:l.filter(c=>Z(t[c],e))}function te(e,t){let a=0;const n=[[],[],[],[]];if(t.globalParts.length){if(!t.globalParts.every(l=>e.joinedParts.includes(l)))return{score:-1,marks:n};a+=1,e.syllables.forEach((l,c)=>{t.globalParts.forEach(o=>{l.parts.includes(o)&&n[c].push(o)})})}if(t.rawGlobalChars.length){if(!t.rawGlobalChars.every(l=>e.characters.includes(l)))return{score:-1,marks:n};a+=1}if(t.globalExcludeChars.length){if(t.globalExcludeChars.some(s=>e.characters.includes(s)))return{score:-1,marks:n};a+=1}for(let s=0;s<4;s+=1){const l=t.fixedChars[s];if(l){if(e.characters[s]!==l)return{score:-1,marks:n};a+=1;continue}const c=t.tones[s];if(c){if(e.syllables[s]?.tone!==c)return{score:-1,marks:n};a+=1}const o=t.positionParts[s];if(o.length){if(!Y(e.syllables[s],o))return{score:-1,marks:n};a+=1,n[s].push(...o)}const i=t.excludeTones[s];if(i){if(e.syllables[s]?.tone===i)return{score:-1,marks:n};a+=1}const d=t.excludeParts[s];if(d.length){if(d.some(h=>e.syllables[s]?.parts.includes(h)))return{score:-1,marks:n};a+=1}const f=t.excludeChars[s];if(f){if(e.characters[s]===f)return{score:-1,marks:n};if(!e.characters.some((p,r)=>r!==s&&p===f))return{score:-1,marks:n};a+=1}}return{score:a,marks:n}}function ae(e,t,a){return e.map(n=>{const s=t[n],l=te(s,a);return{record:s,...l}}).filter(n=>n.score>0).sort((n,s)=>s.score!==n.score?s.score-n.score:n.record.word.localeCompare(s.record.word,"zh-Hans-CN"))}function ne(e){return`
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
  `}function se(e){return`
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
        <span class="field-title">当前排除汉字</span>
        <input type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="汉字" aria-label="第${e}位不包含汉字" />
      </label>
    </article>
  `}function le(){return`
    <div class="page-shell">
      <header class="hero">
        <p class="eyebrow">Chengyu Finder</p>
        <h1>成语猜词助手</h1>
        <p class="hero-copy">
          用包含与不包含条件快速缩小候选范围，右侧会实时显示最接近的成语结果。
        </p>
      </header>

      <main class="layout">
        <section class="panel controls-panel">
          <div class="section-heading">
            <h2>筛选条件</h2>
            <button id="resetButton" class="ghost-button" type="button">清空条件</button>
          </div>

          <section class="guide-panel">
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
          </section>

          <details class="reference-panel">
            <summary>常用声母/韵母速查</summary>
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
                ${[1,2,3,4].map(ne).join("")}
              </div>
            </section>

            <details class="condition-card exclude-card condition-collapse">
              <summary class="condition-card-head collapsible-head">
                <span>
                  <span class="collapse-title">排除</span>
                  <span class="collapse-copy">候选仍很多时再用</span>
                </span>
                <span class="collapse-indicator">展开</span>
              </summary>

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
                ${[1,2,3,4].map(se).join("")}
              </div>
            </details>
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
  `}function oe(){const e=Array.from(document.querySelectorAll("#positionSlots .slot-card")),t=Array.from(document.querySelectorAll("#excludeSlots .slot-card"));return{globalLetters:document.getElementById("globalLetters"),globalChars:document.getElementById("globalChars"),globalExcludeChars:document.getElementById("globalExcludeChars"),globalCharAppendHint:document.getElementById("globalCharAppendHint"),positionCards:e,excludeCards:t,fixedCharInputs:e.map(a=>a.querySelector('[aria-label$="包含汉字"]')),toneInputs:e.map(a=>a.querySelector(".tone-chip")),positionInputs:e.map(a=>a.querySelector('[aria-label$="包含声母韵母"]')),excludeToneInputs:t.map(a=>a.querySelector(".tone-chip-exclude")),excludeInputs:t.map(a=>a.querySelector('[aria-label$="不包含声母韵母"]')),excludeCharInputs:t.map(a=>a.querySelector('[aria-label$="不包含汉字"]')),resetButton:document.getElementById("resetButton"),showMeaningToggle:document.getElementById("showMeaningToggle"),stats:document.getElementById("stats"),resultCount:document.getElementById("resultCount"),results:document.getElementById("results"),template:document.getElementById("resultTemplate")}}const re="/idiom.json";document.querySelector("#app").innerHTML=le();const u=oe();let g=[],N=null;const ce=(e,t=120)=>{let a=0;return(...n)=>{window.clearTimeout(a),a=window.setTimeout(()=>e(...n),t)}};async function ie(e){try{return await navigator.clipboard.writeText(e),!0}catch(t){const a=document.createElement("textarea");a.value=e,a.setAttribute("readonly",""),a.style.position="absolute",a.style.left="-9999px",document.body.appendChild(a),a.select();const n=document.execCommand("copy");return a.remove(),n||console.error(t),n}}function ue(e){if(!e.dataset.validate)return;const t=W(e.value),a=e.parentElement?.querySelector(".field-error");if(e.classList.toggle("input-invalid",t.length>0&&!e.disabled),t.length&&!e.disabled){const n=`可能不合法: ${t.join(", ")}`;e.title=`可能不是合法声母/韵母: ${t.join(", ")}`,a&&(a.textContent=n)}else e.removeAttribute("title"),a&&(a.textContent="")}function L(){u.fixedCharInputs.forEach((e,t)=>{const a=!!e.value.trim(),n=u.positionCards[t],s=u.excludeCards[t],l=[u.toneInputs[t],u.positionInputs[t],u.excludeToneInputs[t],u.excludeInputs[t],u.excludeCharInputs[t]];n.classList.toggle("slot-card-locked",a),s.classList.toggle("slot-card-locked",a),l.forEach(c=>{a&&(c.value=""),c.disabled=a,c.classList.toggle("is-disabled",a)})})}function T(){document.querySelectorAll('[data-validate="parts"]').forEach(e=>ue(e))}function P(){const e=B(u),t=ee(e,g,N),a=ae(t,g,e);k(u,g,a.slice(0,V),e,a.length)}async function de(){try{const e=await fetch(re);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();g=R(t),N=J(g),u.stats.textContent=`词库读取完成，共 ${g.length.toLocaleString()} 条四字成语。`,L(),T(),k(u,g,[],B(u))}catch(e){U(u,e)}}const pe=ce(()=>{L(),T(),P()},80);[u.globalLetters,u.globalChars,u.globalExcludeChars,...u.fixedCharInputs,...u.toneInputs,...u.positionInputs,...u.excludeToneInputs,...u.excludeInputs,...u.excludeCharInputs].forEach(e=>{e.addEventListener("input",pe)});u.showMeaningToggle.addEventListener("change",P);u.results.addEventListener("click",async e=>{const t=e.target.closest(".copy-button");if(!t)return;const a=await ie(t.dataset.word||""),n=t.innerHTML,s=t.title;t.innerHTML=a?'<span class="copy-feedback">✓</span>':'<span class="copy-feedback">!</span>',t.title=a?"已复制":"复制失败",window.setTimeout(()=>{t.innerHTML=n,t.title=s},1200)});u.resetButton.addEventListener("click",()=>{u.globalLetters.value="",u.globalChars.value="",u.globalExcludeChars.value="",u.fixedCharInputs.forEach(e=>{e.value=""}),u.toneInputs.forEach(e=>{e.value=""}),u.positionInputs.forEach(e=>{e.value=""}),u.excludeToneInputs.forEach(e=>{e.value=""}),u.excludeInputs.forEach(e=>{e.value=""}),u.excludeCharInputs.forEach(e=>{e.value=""}),L(),T(),P(),u.globalLetters.focus()});de();

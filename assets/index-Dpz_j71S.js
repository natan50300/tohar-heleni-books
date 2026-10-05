(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=.92,t=null,n=[76,79,84,83,79,t,81,77,81,79,t,t,76,79,84,86,83,t,84,81,77,79,t,t,81,84,81,79,76,t,77,81,77,76,t,t,74,77,81,79,76,72,74,76,74,72,t,t],r=[60,55,53,60,60,55,53,60,53,60,53,60,55,60,55,60],i=e=>440*2**((e-69)/12),a=null,o=null,s=null,c=0,l=0;function u(e,t,n,r){let i=a.createOscillator(),s=a.createGain();i.type=`sine`,i.frequency.value=e,s.gain.setValueAtTime(0,t),s.gain.linearRampToValueAtTime(n,t+.012),s.gain.exponentialRampToValueAtTime(1e-4,t+r),i.connect(s).connect(o),i.start(t),i.stop(t+r+.05)}function d(){for(;c<a.currentTime+.8;){let a=n[l%n.length];a!==t&&(u(i(a),c,.16,2.4),u(i(a)*2,c,.035,.7)),l%3==0&&u(i(r[l/3%r.length]),c,.1,2.6),c+=e,l++}}function f(){let e=window.AudioContext||window.webkitAudioContext;e&&(a||(a=new e,o=a.createGain(),o.gain.value=0,o.connect(a.destination)),a.resume?.(),o.gain.cancelScheduledValues(a.currentTime),o.gain.setTargetAtTime(.5,a.currentTime,.8),!s&&(c=a.currentTime+.15,l=0,d(),s=setInterval(d,250)))}function p(){a&&s&&(clearInterval(s),s=null,o.gain.cancelScheduledValues(a.currentTime),o.gain.setTargetAtTime(0,a.currentTime,.4))}var m=`/tohar-heleni-books/`,h=4,g={rain:3.5,waves:2,lion:.6},_={waves:[5,7.5],cow:[0,2.6],duck:[0,2.6],dog:[0,2],lion:[0,2.5],monkey:[0,2.5],parrot:[0,2],elephant:[0,3],penguin:[0,3.5],zebra:[0,2.2],trainwhistle:[0,2],trainchug:[1,4.5]},v={cow:1,sheep:1.15,duck:1,dog:1,cat:1.1,rooster:1.12,hen:1.12,horse:1.2,frog:1.15},y=null,b=null,x=new Map;function S(){let e=window.AudioContext||window.webkitAudioContext;return e?(y||(y=new e),y.resume?.(),y):null}function C(e){return x.has(e)||x.set(e,fetch(`${m}sounds/${e}.mp3?v=10`).then(t=>t.ok?t.arrayBuffer():Promise.reject(Error(e))).then(e=>new Promise((t,n)=>y.decodeAudioData(e,t,n))).catch(()=>(x.delete(e),null))),x.get(e)}function w(e){S()&&e.forEach(C)}async function T(e,t=v[e]||1){if(!S())return;let n=await C(e);if(!n)return;b?.stop();let r=y.createBufferSource(),i=y.createGain();r.buffer=n,r.playbackRate.value=t,r.connect(i).connect(y.destination);let[a,o]=_[e]||[0,h],s=Math.min((n.duration-a)/t,o),c=y.currentTime,l=g[e]||1;i.gain.setValueAtTime(a?0:l,c),i.gain.linearRampToValueAtTime(l,c+.4),i.gain.setValueAtTime(l,c+Math.max(.4,s-(a?1.5:.3))),i.gain.linearRampToValueAtTime(0,c+s),r.start(c,a),r.stop(c+s),r.onended=()=>b===r&&(b=null),b=r}var E=[[64,.5],[64,.5],[67,2],[64,.5],[64,.5],[67,2],[64,.5],[67,.5],[72,1],[71,1.5],[69,.5],[69,1],[67,2.5]],D=0;function O(){if(!S()||y.currentTime<D)return;let e=.62,t=y.currentTime+.1;for(let[n,r]of E){let i=y.createOscillator(),a=y.createGain();i.type=`sine`,i.frequency.value=440*2**((n+12-69)/12),a.gain.setValueAtTime(0,t),a.gain.linearRampToValueAtTime(.11,t+.05),a.gain.exponentialRampToValueAtTime(1e-4,t+r*e+.9),i.connect(a).connect(y.destination),i.start(t),i.stop(t+r*e+1),t+=r*e}let n=t+1,r=Math.ceil((n-y.currentTime)*y.sampleRate),i=y.createBuffer(1,r,y.sampleRate),a=i.getChannelData(0);for(let e=0;e<r;e++)a[e]=Math.random()*2-1;let o=y.createBufferSource();o.buffer=i;let s=y.createBiquadFilter();s.type=`bandpass`,s.frequency.value=520,s.Q.value=.8;let c=y.createGain();c.gain.setValueAtTime(0,y.currentTime);for(let e=y.currentTime+.2;e<n-3;e+=3.4)c.gain.linearRampToValueAtTime(.09,e+1.2),c.gain.linearRampToValueAtTime(.01,e+1.6),c.gain.linearRampToValueAtTime(.06,e+2.6),c.gain.linearRampToValueAtTime(0,e+3.3);o.connect(s).connect(c).connect(y.destination),o.start(),o.stop(n),D=n}var k=`/tohar-heleni-books/`,A=document.getElementById(`app`),j={both:`טוהר והלני`,tohar:`טוהר`,heleni:`הלני`},M=[[`all`,`כל הספרים`],[`both`,`ביחד`],[`tohar`,`טוהר`],[`heleni`,`הלני`]],N=900,P=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),F=e=>String(e).padStart(2,`0`),I={get:e=>{try{return localStorage.getItem(e)}catch{return null}},set:(e,t)=>{try{localStorage.setItem(e,t)}catch{}}},L=()=>matchMedia(`(prefers-reduced-motion: reduce)`).matches,R=()=>matchMedia(`(display-mode: standalone)`).matches||navigator.standalone===!0;async function z(e){let t=await fetch(k+e);if(!t.ok)throw Error(e);return t.json()}var B=(e={})=>`--c1:${P(e.from||`#33405f`)};--c2:${P(e.to||`#6a5a78`)}`,V=null;addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),V=e,document.querySelector(`.install`)?.removeAttribute(`hidden`)});async function H(){document.body.dataset.view=`library`;let e=[];try{e=await z(`books/index.json`)}catch{}let t=I.get(`filter`)||`all`;A.innerHTML=`
    <main class="library">
      <header class="library-head">
        <h1>הספרים של טוהר והלני</h1>
        <a class="help-link" href="#/help" aria-label="עזרה">?</a>
      </header>
      <nav class="filters">
        ${M.map(([e,n])=>`<button class="chip" data-filter="${e}" aria-pressed="${e===t}">${n}</button>`).join(``)}
      </nav>
      <section class="shelves"></section>
      <button class="install" ${R()?`hidden`:``}>📱 להתקין כאפליקציה (בלי שורת הכתובת)</button>
    </main>`;let n=A.querySelector(`.shelves`),r=t=>{let r=e.filter(e=>t===`all`||e.for===t);n.innerHTML=r.length?r.map(e=>`
        <a class="book" href="#/book/${P(e.id)}">
          <div class="cover" style="${B(e.palette)}">
            ${e.hasArt?`<img loading="lazy" alt="" src="${k}books/${P(e.id)}/cover-800.webp?v=${e.rev||0}"
                     srcset="${k}books/${P(e.id)}/cover-800.webp?v=${e.rev||0} 800w, ${k}books/${P(e.id)}/cover-1600.webp?v=${e.rev||0} 1600w"
                     sizes="(max-width: 600px) 45vw, 200px">`:``}
            <span class="cover-title">${P(e.title)}</span>
            <span class="badge">${j[e.for]||``}</span>
            ${e.sounds?`<span class="badge sound">🔊 נוגעים ושומעים</span>`:``}
          </div>
        </a>`).join(``):`<p class="empty">הספרים בדרך...</p>`};r(t),A.querySelector(`.filters`).addEventListener(`click`,e=>{let t=e.target.closest(`.chip`);t&&(I.set(`filter`,t.dataset.filter),A.querySelectorAll(`.chip`).forEach(e=>e.setAttribute(`aria-pressed`,e===t)),r(t.dataset.filter))}),A.querySelector(`.install`).addEventListener(`click`,async()=>{if(!V){location.hash=`#/help`;return}V.prompt(),await V.userChoice.catch(()=>{}),V=null})}function U(){document.body.dataset.view=`help`,A.innerHTML=`
    <main class="help">
      <a class="back" href="#/">→ חזרה לספרים</a>
      <h1>איך משתמשים</h1>
      <h2>התקנה כאפליקציה באייפון</h2>
      <ol>
        <li>פותחים את האתר ב-Safari.</li>
        <li>לוחצים על כפתור השיתוף (ריבוע עם חץ למעלה).</li>
        <li>גוללים ובוחרים "הוסף למסך הבית", ואז "הוסף".</li>
        <li>פותחים מהאייקון החדש. שם אין שורת כתובת.</li>
      </ol>
      <h2>התקנה כאפליקציה באנדרואיד</h2>
      <ol>
        <li>לוחצים על שלוש הנקודות בדפדפן.</li>
        <li>בוחרים "הוסף למסך הבית" או "התקן אפליקציה".</li>
        <li>פותחים מהאייקון החדש.</li>
      </ol>
      <h2>קריאה</h2>
      <ol>
        <li>בוחרים ספר ומסובבים את הטלפון לרוחב.</li>
        <li>מדפדפים בהחלקה, כמו בספר עברי, או בלחיצה בצדי המסך.</li>
        <li>הכפתור ♪ למעלה מימין, ליד ה-✕, מדליק ומכבה את מנגינת הלילה טוב.</li>
        <li>בספרים שמסומנים "🔊 נוגעים ושומעים": נוגעים בטוהר או בהלני והן צוחקות, וכשהן ישנות שומעים נשימות ושיר ערש. גם החיות, הגשם והגלים משמיעים קול. בשאר הספרים יש רק צחוק ומנגינה.</li>
      </ol>
      <h2>אם אין מנגינה באייפון</h2>
      <p>בודקים שהמתג השקט בצד הטלפון לא מופעל ושהווליום פתוח.</p>
      <h2>קולות החיות</h2>
      <p>הקלטות אמיתיות מ-Wikimedia Commons. כבשה: Secretlondon (CC BY-SA 3.0). חתול: Heismark. תרנגול ותרנגולת: alys (נחלת הכלל). סוס: Briefer, Maigrot, Mandel ואחרים (CC BY 4.0). צחוק: lmbubec (CC0), morgantj ו-reinsamba (CC BY 3.0). צפרדע: MichaeltheFox8621 (CC BY-SA 4.0). גשם: ジダネ (נחלת הכלל). גלי ים, ברווז, פרה, כלבלב, פיל, זברה ופינגווינים: נוצרו ב-Suno. קוף, אריה, תוכי ורכבת: Mixkit. שחף: avphillips (נחלת הכלל).</p>
      <h2>בלי אינטרנט</h2>
      <p>ספר שנפתח פעם אחת נשמר בטלפון, ואפשר לקרוא בו גם בלי אינטרנט.</p>
    </main>`}var W=null;async function G(e){document.body.dataset.view=`reader`;let t;try{t=await z(`books/${e}/book.json`)}catch{location.hash=`#/`;return}let n=Math.max(screen.width,screen.height)*(devicePixelRatio||1)>1e3?1600:800,r=r=>`${k}books/${e}/${r}-${n}.webp?v=${t.rev||0}`,i=[{cover:!0,text:t.title,sub:t.subtitle,src:r(`cover`),spots:t.coverSpots},...t.pages.map((e,t)=>({text:e.text,src:r(`p`+F(t+1)),spots:e.spots,sleep:e.sleep}))],a=i.length;A.innerHTML=`
    <main class="reader" style="${B(t.palette)};--ratio:${Number(t.ratio)||1.5}">
      <div class="backdrop"></div>
      <div class="stage"></div>
      <div class="band"></div>
      <div class="hint" hidden>${t.quiet?`👆 געו ב${{tohar:`טוהר והיא צוחקת`,heleni:`הלני והיא צוחקת`}[t.for]||`בנות והן צוחקות`} · מנגינה: כפתור ♪ למעלה מימין`:`👆 `+P(t.hint||`געו בחיה כדי לשמוע אותה`)}</div>
      <div class="end" hidden>
        <p>לילה טוב 🌙</p>
        <div class="end-actions">
          <button class="btn" data-again>לקרוא שוב</button>
          <a class="btn" href="#/">חזרה לספרים</a>
        </div>
      </div>
      <a class="close" href="#/" aria-label="חזרה לספרים">✕</a>
      <button class="music" aria-label="מנגינה">♪</button>
      <div class="pager">
        <button class="nav next" aria-label="העמוד הבא">‹</button>
        <span class="counter"></span>
        <button class="nav prev" aria-label="העמוד הקודם">›</button>
      </div>
    </main>`;let o=A.querySelector(`.reader`),s=o.querySelector(`.stage`),c=o.querySelector(`.backdrop`),l=o.querySelector(`.band`),u=o.querySelector(`.end`),d=o.querySelector(`.counter`),m=o.querySelector(`.prev`),h=o.querySelector(`.next`),g=o.querySelector(`.music`),_=0,v=!1,y=e=>e===a||!t.hasArt?`<div class="plain${e===a?` night`:``}"></div>`:`<img alt="" draggable="false" src="${i[e].src}">`,b=(e,t,n=`half`)=>`<div class="${n} ${t}"><div class="full">${y(e)}</div></div>`,x=e=>{let n=i[e];o.classList.toggle(`is-cover`,!!n?.cover),l.innerHTML=n?`${P(n.text).replace(/\n/g,`<br>`)}${n.sub?`<small>${P(n.sub)}</small>`:``}`:``,u.hidden=e!==a,o.querySelector(`.hint`).hidden=!(n&&(e===0||n.spots&&!t.quiet)),c.style.backgroundImage=n&&t.hasArt?`url("${n.src}")`:`none`,d.textContent=e===0||e===a?``:`${e} / ${a-1}`,m.disabled=e===0,h.disabled=e===a},S=e=>{s.innerHTML=`<div class="sheet">${y(e)}</div>`,_=e,x(e),o.classList.remove(`turning`),v=!1,t.hasArt&&[e+1,e-1].forEach(e=>i[e]&&(new Image().src=i[e].src))},C=(e,t)=>{if(L())return S(e);v=!0,o.classList.add(`turning`);let[n,r,i]=t>0?[`left`,`right`,`fwd`]:[`right`,`left`,`back`];s.innerHTML=`
      <div class="sheet">${y(e)}</div>
      ${b(_,r)}
      <div class="leaf ${i}">
        ${b(_,n,`face front`)}
        ${b(e,r,`face rear`)}
      </div>`,setTimeout(()=>x(e),N/2),setTimeout(()=>S(e),N)},E=e=>{let t=_+e;v||t<0||t>a||C(t,e)};m.onclick=()=>E(-1),h.onclick=()=>E(1),u.addEventListener(`click`,e=>{e.target.closest(`[data-again]`)&&C(0,-1)});let D=I.get(`music`)!==`off`,j=()=>{g.classList.toggle(`off`,!D),D?f():p()};g.onclick=()=>{D=!D,I.set(`music`,D?`on`:`off`),j()};let M=null,V=async()=>{if(D&&f(),!R())try{document.fullscreenElement||await document.documentElement.requestFullscreen?.({navigationUI:`hide`}),await screen.orientation?.lock?.(`landscape`)}catch{}};navigator.wakeLock?.request(`screen`).then(e=>M=e).catch(()=>{});let H=(e,n)=>{let r=s.getBoundingClientRect(),i=Math.max(r.height,r.width/(Number(t.ratio)||1.5));return[(e-r.left)/r.width,(n-r.top+(i-r.height)*.35)/i]},U=(e,n)=>{let r=i[_]?.spots;if(!r||t.quiet)return!1;let[a,o]=H(e,n),s=Number(t.ratio)||1.5,c=[...r].sort((e,t)=>e.r-t.r).find(e=>Math.hypot((a-e.x)*s,o-e.y)<e.r);return c?(T(c.sound),X(e,n),!0):!1},G={tohar:[`laugh-baby`],heleni:[`laugh-girl`,`laugh-child`],both:[`laugh-girl`,`laugh-baby`,`laugh-child`]},q=t.laughs||G[t.for]||G.both,J=0,Y=(e,n)=>{if(!(t.quiet&&i[_]?.sleep)){if(X(e,n),i[_]?.sleep)return O();T(q[J++%q.length],.92+Math.random()*.3)}},X=(e,t)=>{let n=document.createElement(`span`);n.className=`ring`,n.style.left=e+`px`,n.style.top=t+`px`,o.append(n),setTimeout(()=>n.remove(),700)},Z=null,Q=0;o.addEventListener(`pointerdown`,e=>{V(),!e.target.closest(`button, a`)&&(Z=e.clientX,Q=e.clientY)}),o.addEventListener(`pointerup`,e=>{if(Z===null)return;let t=e.clientX-Z,n=e.clientY-Q;if(Z=null,Math.abs(t)>40&&Math.abs(t)>Math.abs(n))E(t>0?1:-1);else if(Math.abs(t)<10&&Math.abs(n)<10){if(!v&&U(e.clientX,e.clientY))return;let t=e.clientX/innerWidth;t<.3?E(1):t>.7?E(-1):!v&&_<a&&Y(e.clientX,e.clientY)}}),o.addEventListener(`pointercancel`,()=>Z=null);let $=e=>{e.key===`ArrowLeft`||e.key===` `?E(1):e.key===`ArrowRight`?E(-1):e.key===`Escape`&&(location.hash=`#/`)};addEventListener(`keydown`,$),W=()=>{removeEventListener(`keydown`,$),p(),M?.release?.().catch(()=>{}),screen.orientation?.unlock?.(),document.fullscreenElement&&document.exitFullscreen?.().catch(()=>{})},S(_),j(),V(),t.hasArt&&K(i.map(e=>e.src)),w([...new Set([...q,...i.flatMap(e=>(e.spots||[]).map(e=>e.sound))])])}async function K(e){if(`caches`in window)try{let t=await caches.open(`books-v1`),n=e[0].slice(0,e[0].lastIndexOf(`/`)+1);for(let r of await t.keys())r.url.includes(n)&&!e.some(e=>r.url.endsWith(e))&&await t.delete(r);for(let n of e)await t.match(n)||await t.add(n).catch(()=>{})}catch{}}function q(){W?.(),W=null;let e=location.hash.slice(1)||`/`,t=e.match(/^\/book\/([\w-]+)$/);t?G(t[1]):e===`/help`?U():H(),scrollTo(0,0)}async function J(){if(document.body.dataset.view!==`reader`)try{let{build:e}=await fetch(k+`version.json`,{cache:`no-store`}).then(e=>e.json());if(e===`1791194677607`||sessionStorage.getItem(`reloaded`)===e)return;sessionStorage.setItem(`reloaded`,e),await fetch(location.origin+k,{cache:`reload`}).catch(()=>{}),location.reload()}catch{}}addEventListener(`hashchange`,()=>{q(),J()}),document.addEventListener(`visibilitychange`,()=>document.visibilityState===`visible`&&J()),q(),J(),`serviceWorker`in navigator&&navigator.serviceWorker.register(k+`sw.js`,{scope:k}).then(async()=>{await navigator.serviceWorker.ready;let e=performance.getEntriesByType(`resource`).map(e=>e.name).filter(e=>e.startsWith(location.origin)&&!e.endsWith(`.json`)),t=await caches.open(`runtime-v1`);await Promise.all([location.origin+k,...e].map(e=>t.add(e).catch(()=>{})))});
import '@fontsource/varela-round/hebrew-400.css';
import '@fontsource/varela-round/latin-400.css';
import './style.css';
import { startMusic, stopMusic } from './music.js';
import { playAnimal, playSleep, prepareAnimals } from './sounds.js';

const BASE = import.meta.env.BASE_URL;
const app = document.getElementById('app');
const FOR_LABEL = { both: 'טוהר והלני', tohar: 'טוהר', heleni: 'הלני' };
const FILTERS = [
  ['all', 'כל הספרים'],
  ['both', 'ביחד'],
  ['tohar', 'טוהר'],
  ['heleni', 'הלני'],
];
const TURN_MS = 900;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

async function getJSON(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(path);
  return res.json();
}

const paletteStyle = (p = {}) => `--c1:${esc(p.from || '#33405f')};--c2:${esc(p.to || '#6a5a78')}`;

// Android offers a real install prompt; keep it until the user asks for it.
let installPrompt = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  document.querySelector('.install')?.removeAttribute('hidden');
});

// ---------- Library ----------

async function showLibrary() {
  document.body.dataset.view = 'library';
  let books = [];
  try {
    books = await getJSON('books/index.json');
  } catch {}
  const filter = store.get('filter') || 'all';

  app.innerHTML = `
    <main class="library">
      <header class="library-head">
        <h1>הספרים של טוהר והלני</h1>
        <a class="help-link" href="#/help" aria-label="עזרה">?</a>
      </header>
      <nav class="filters">
        ${FILTERS.map(([id, label]) => `<button class="chip" data-filter="${id}" aria-pressed="${id === filter}">${label}</button>`).join('')}
      </nav>
      <section class="shelves"></section>
      <button class="install" ${isInstalled() ? 'hidden' : ''}>📱 להתקין כאפליקציה (בלי שורת הכתובת)</button>
    </main>`;

  const shelves = app.querySelector('.shelves');
  const draw = (f) => {
    const list = books.filter((b) => f === 'all' || b.for === f);
    shelves.innerHTML = list.length
      ? list
          .map(
            (b) => `
        <a class="book" href="#/book/${esc(b.id)}">
          <div class="cover" style="${paletteStyle(b.palette)}">
            ${
              b.hasArt
                ? `<img loading="lazy" alt="" src="${BASE}books/${esc(b.id)}/cover-800.webp?v=${b.rev || 0}"
                     srcset="${BASE}books/${esc(b.id)}/cover-800.webp?v=${b.rev || 0} 800w, ${BASE}books/${esc(b.id)}/cover-1600.webp?v=${b.rev || 0} 1600w"
                     sizes="(max-width: 600px) 45vw, 200px">`
                : ''
            }
            <span class="cover-title">${esc(b.title)}</span>
            <span class="badge">${FOR_LABEL[b.for] || ''}</span>
            ${b.sounds ? '<span class="badge sound">🔊 נוגעים ושומעים</span>' : ''}
          </div>
        </a>`,
          )
          .join('')
      : `<p class="empty">הספרים בדרך...</p>`;
  };
  draw(filter);

  app.querySelector('.filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    store.set('filter', chip.dataset.filter);
    app.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === chip));
    draw(chip.dataset.filter);
  });

  app.querySelector('.install').addEventListener('click', async () => {
    if (!installPrompt) {
      location.hash = '#/help';
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    installPrompt = null;
  });
}

// ---------- Help ----------

function showHelp() {
  document.body.dataset.view = 'help';
  app.innerHTML = `
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
      <p>הקלטות אמיתיות מ-Wikimedia Commons. כבשה: Secretlondon (CC BY-SA 3.0). חתול: Heismark. תרנגול ותרנגולת: alys (נחלת הכלל). סוס: Briefer, Maigrot, Mandel ואחרים (CC BY 4.0). צחוק: lmbubec (CC0), morgantj ו-reinsamba (CC BY 3.0). צפרדע: MichaeltheFox8621 (CC BY-SA 4.0). גשם: ジダネ (נחלת הכלל). גלי ים, ברווז, פרה, כלבלב, פיל, זברה ופינגווינים: נוצרו ב-Suno. קוף, אריה ותוכי: Mixkit. שחף: avphillips (נחלת הכלל).</p>
      <h2>בלי אינטרנט</h2>
      <p>ספר שנפתח פעם אחת נשמר בטלפון, ואפשר לקרוא בו גם בלי אינטרנט.</p>
    </main>`;
}

// ---------- Reader ----------

let closeReader = null;

async function openBook(id) {
  document.body.dataset.view = 'reader';
  let book;
  try {
    book = await getJSON(`books/${id}/book.json`);
  } catch {
    location.hash = '#/';
    return;
  }

  // Phones in landscape need the large file; choose once so the offline copy matches what is shown.
  const size = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) > 1000 ? 1600 : 800;
  const img = (name) => `${BASE}books/${id}/${name}-${size}.webp?v=${book.rev || 0}`;
  const pages = [
    { cover: true, text: book.title, sub: book.subtitle, src: img('cover'), spots: book.coverSpots },
    ...book.pages.map((p, i) => ({ text: p.text, src: img('p' + pad(i + 1)), spots: p.spots, sleep: p.sleep })),
  ];
  const last = pages.length; // index of the "the end" screen

  app.innerHTML = `
    <main class="reader" style="${paletteStyle(book.palette)};--ratio:${Number(book.ratio) || 1.5}">
      <div class="backdrop"></div>
      <div class="stage"></div>
      <div class="band"></div>
      <div class="hint" hidden>${book.quiet ? `👆 געו ב${{ tohar: 'טוהר והיא צוחקת', heleni: 'הלני והיא צוחקת' }[book.for] || 'בנות והן צוחקות'} · מנגינה: כפתור ♪ למעלה מימין` :'👆 ' + esc(book.hint || 'געו בחיה כדי לשמוע אותה')}</div>
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
    </main>`;

  const root = app.querySelector('.reader');
  const stage = root.querySelector('.stage');
  const backdrop = root.querySelector('.backdrop');
  const band = root.querySelector('.band');
  const endEl = root.querySelector('.end');
  const counter = root.querySelector('.counter');
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  const musicBtn = root.querySelector('.music');
  let idx = 0; // a book always opens at its cover
  let turning = false;

  // What fills the whole screen for page i.
  const fill = (i) =>
    i === last || !book.hasArt ? `<div class="plain${i === last ? ' night' : ''}"></div>` : `<img alt="" draggable="false" src="${pages[i].src}">`;
  // One half of page i, cut at the spine.
  const half = (i, side, cls = 'half') => `<div class="${cls} ${side}"><div class="full">${fill(i)}</div></div>`;

  const setChrome = (i) => {
    const p = pages[i];
    root.classList.toggle('is-cover', !!p?.cover);
    band.innerHTML = p ? `${esc(p.text).replace(/\n/g, '<br>')}${p.sub ? `<small>${esc(p.sub)}</small>` : ''}` : '';
    endEl.hidden = i !== last;
    root.querySelector('.hint').hidden = !(p && (i === 0 || (p.spots && !book.quiet)));
    backdrop.style.backgroundImage = p && book.hasArt ? `url("${p.src}")` : 'none';
    counter.textContent = i === 0 || i === last ? '' : `${i} / ${last - 1}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === last;
  };

  const settle = (i) => {
    stage.innerHTML = `<div class="sheet">${fill(i)}</div>`;
    idx = i;
    setChrome(i);
    root.classList.remove('turning');
    turning = false;
    // Have the neighbours ready so a turn never shows an empty page.
    if (book.hasArt) [i + 1, i - 1].forEach((n) => pages[n] && (new Image().src = pages[n].src));
  };

  // A real page turn: the leaf swings over the spine. Its front is half of the page we leave,
  // its back is half of the page we arrive at. Forward in a Hebrew book = left leaf turns to the right.
  const turn = (to, step) => {
    if (reducedMotion()) return settle(to);
    turning = true;
    root.classList.add('turning');
    const [leafSide, staySide, dirClass] = step > 0 ? ['left', 'right', 'fwd'] : ['right', 'left', 'back'];
    stage.innerHTML = `
      <div class="sheet">${fill(to)}</div>
      ${half(idx, staySide)}
      <div class="leaf ${dirClass}">
        ${half(idx, leafSide, 'face front')}
        ${half(to, staySide, 'face rear')}
      </div>`;
    setTimeout(() => setChrome(to), TURN_MS / 2);
    setTimeout(() => settle(to), TURN_MS);
  };

  const go = (step) => {
    const to = idx + step;
    if (turning || to < 0 || to > last) return;
    turn(to, step);
  };

  prevBtn.onclick = () => go(-1);
  nextBtn.onclick = () => go(1);
  endEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-again]')) turn(0, -1);
  });

  // ----- music -----
  let musicOn = store.get('music') !== 'off';
  const syncMusic = () => {
    musicBtn.classList.toggle('off', !musicOn);
    if (musicOn) startMusic();
    else stopMusic();
  };
  musicBtn.onclick = () => {
    musicOn = !musicOn;
    store.set('music', musicOn ? 'on' : 'off');
    syncMusic();
  };

  // ----- full screen, landscape, screen stays on (where the phone allows it) -----
  let wakeLock = null;
  const immerse = async () => {
    if (musicOn) startMusic(); // browsers only allow sound after a touch
    if (isInstalled()) return;
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape');
    } catch {}
  };
  navigator.wakeLock
    ?.request('screen')
    .then((lock) => (wakeLock = lock))
    .catch(() => {});

  // Where a touch lands on the picture itself (0..1), allowing for the strip trimmed off on wide screens.
  const onPicture = (clientX, clientY) => {
    const box = stage.getBoundingClientRect();
    const shown = Math.max(box.height, box.width / (Number(book.ratio) || 1.5));
    return [(clientX - box.left) / box.width, (clientY - box.top + (shown - box.height) * 0.35) / shown];
  };
  // Animals answer when touched. Spots are {sound, x, y, r} in picture units; r is a share of the height.
  const touchAnimal = (clientX, clientY) => {
    const spots = pages[idx]?.spots;
    if (!spots || book.quiet) return false;
    const [x, y] = onPicture(clientX, clientY);
    const ratio = Number(book.ratio) || 1.5;
    const hit = [...spots].sort((a, b) => a.r - b.r).find((s) => Math.hypot((x - s.x) * ratio, y - s.y) < s.r);
    if (!hit) return false;
    playAnimal(hit.sound);
    ring(clientX, clientY);
    return true;
  };

  // A touch on the girls (the middle of the picture) answers with a laugh, a different one each time.
  const LAUGHS = { tohar: ['laugh-baby'], heleni: ['laugh-girl', 'laugh-child'], both: ['laugh-girl', 'laugh-baby', 'laugh-child'] };
  const laughs = book.laughs || LAUGHS[book.for] || LAUGHS.both;
  let laughTurn = 0;
  const giggle = (clientX, clientY) => {
    if (book.quiet && pages[idx]?.sleep) return; // a quiet book: laughs only, and she is not woken up
    ring(clientX, clientY);
    if (pages[idx]?.sleep) return playSleep(); // she is asleep: breathing and a lullaby instead of a laugh
    playAnimal(laughs[laughTurn++ % laughs.length], 0.92 + Math.random() * 0.3);
  };

  const ring = (clientX, clientY) => {
    const el = document.createElement('span');
    el.className = 'ring';
    el.style.left = clientX + 'px';
    el.style.top = clientY + 'px';
    root.append(el);
    setTimeout(() => el.remove(), 700);
  };

  let startX = null;
  let startY = 0;
  root.addEventListener('pointerdown', (e) => {
    immerse();
    if (e.target.closest('button, a')) return;
    startX = e.clientX;
    startY = e.clientY;
  });
  root.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx > 0 ? 1 : -1); // swipe right = turn forward, like a Hebrew book
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (!turning && touchAnimal(e.clientX, e.clientY)) return;
      const x = e.clientX / innerWidth;
      if (x < 0.3) go(1);
      else if (x > 0.7) go(-1);
      else if (!turning && idx < last) giggle(e.clientX, e.clientY);
    }
  });
  root.addEventListener('pointercancel', () => (startX = null));

  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === ' ') go(1);
    else if (e.key === 'ArrowRight') go(-1);
    else if (e.key === 'Escape') location.hash = '#/';
  };
  addEventListener('keydown', onKey);

  closeReader = () => {
    removeEventListener('keydown', onKey);
    stopMusic();
    wakeLock?.release?.().catch(() => {});
    screen.orientation?.unlock?.();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };

  settle(idx);
  syncMusic();
  immerse(); // works when the book was opened by a tap; otherwise the first touch does it
  if (book.hasArt) saveOffline(pages.map((p) => p.src));
  prepareAnimals([...new Set([...laughs, ...pages.flatMap((p) => (p.spots || []).map((s) => s.sound))])]);
}

// Keep every page of an opened book on the phone.
async function saveOffline(urls) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open('books-v1');
    // Drop pictures of this book that were saved from an older revision.
    const folder = urls[0].slice(0, urls[0].lastIndexOf('/') + 1);
    for (const req of await cache.keys()) {
      if (req.url.includes(folder) && !urls.some((u) => req.url.endsWith(u))) await cache.delete(req);
    }
    for (const url of urls) {
      if (!(await cache.match(url))) await cache.add(url).catch(() => {});
    }
  } catch {}
}

// ---------- Router ----------

function route() {
  closeReader?.();
  closeReader = null;
  const hash = location.hash.slice(1) || '/';
  const m = hash.match(/^\/book\/([\w-]+)$/);
  if (m) openBook(m[1]);
  else if (hash === '/help') showHelp();
  else showLibrary();
  scrollTo(0, 0);
}

// A phone keeps the app open for days. When a newer version is online, load it (never in the middle of a book).
async function checkForUpdate() {
  if (!import.meta.env.PROD || document.body.dataset.view === 'reader') return;
  try {
    const { build } = await fetch(BASE + 'version.json', { cache: 'no-store' }).then((r) => r.json());
    if (build === __BUILD__ || sessionStorage.getItem('reloaded') === build) return;
    sessionStorage.setItem('reloaded', build);
    await fetch(location.origin + BASE, { cache: 'reload' }).catch(() => {});
    location.reload();
  } catch {}
}

addEventListener('hashchange', () => {
  route();
  checkForUpdate();
});
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && checkForUpdate());
route();
checkForUpdate();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).then(async () => {
    await navigator.serviceWorker.ready;
    // Code, styles and fonts loaded before the worker took over: store them for offline use.
    const urls = performance
      .getEntriesByType('resource')
      .map((r) => r.name)
      .filter((u) => u.startsWith(location.origin) && !u.endsWith('.json'));
    const cache = await caches.open('runtime-v1');
    await Promise.all([location.origin + BASE, ...urls].map((u) => cache.add(u).catch(() => {})));
  });
}

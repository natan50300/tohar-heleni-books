import '@fontsource/varela-round/hebrew-400.css';
import '@fontsource/varela-round/latin-400.css';
import './style.css';

const BASE = import.meta.env.BASE_URL;
const app = document.getElementById('app');
const FOR_LABEL = { both: 'טוהר והלני', tohar: 'טוהר', heleni: 'הלני' };
const FILTERS = [
  ['all', 'כל הספרים'],
  ['both', 'ביחד'],
  ['tohar', 'טוהר'],
  ['heleni', 'הלני'],
];

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

async function getJSON(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(path);
  return res.json();
}

const paletteStyle = (p = {}) => `--c1:${esc(p.from || '#33405f')};--c2:${esc(p.to || '#6a5a78')}`;

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
                ? `<img loading="lazy" alt="" src="${BASE}books/${esc(b.id)}/cover-800.webp"
                     srcset="${BASE}books/${esc(b.id)}/cover-800.webp 800w, ${BASE}books/${esc(b.id)}/cover-1600.webp 1600w"
                     sizes="(max-width: 600px) 45vw, 200px">`
                : ''
            }
            <span class="cover-title">${esc(b.title)}</span>
            <span class="badge">${FOR_LABEL[b.for] || ''}</span>
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
}

// ---------- Help ----------

function showHelp() {
  document.body.dataset.view = 'help';
  app.innerHTML = `
    <main class="help">
      <a class="back" href="#/">→ חזרה לספרים</a>
      <h1>איך משתמשים</h1>
      <h2>הוספה למסך הבית באייפון</h2>
      <ol>
        <li>פותחים את האתר ב-Safari.</li>
        <li>לוחצים על כפתור השיתוף (ריבוע עם חץ למעלה).</li>
        <li>גוללים ובוחרים "הוסף למסך הבית".</li>
        <li>לוחצים "הוסף". מעכשיו יש אייקון כמו לאפליקציה.</li>
      </ol>
      <h2>קריאה</h2>
      <ol>
        <li>בוחרים ספר ומסובבים את הטלפון לרוחב.</li>
        <li>מדפדפים בהחלקה, כמו בספר עברי, או בחיצים בצדדים.</li>
        <li>הספר זוכר באיזה עמוד עצרתם.</li>
      </ol>
      <h2>בלי אינטרנט</h2>
      <p>ספר שנפתח פעם אחת נשמר בטלפון, ואפשר לקרוא בו גם בלי אינטרנט.</p>
      <h2>אם הטלפון לא מסתובב</h2>
      <p>פותחים את מרכז הבקרה ומכבים את "נעילת כיוון המסך".</p>
    </main>`;
}

// ---------- Reader ----------

let reader = null;

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
  const img = (name) => `${BASE}books/${id}/${name}-${size}.webp`;
  const pages = [
    { cover: true, text: book.title, sub: book.subtitle, src: img('cover') },
    ...book.pages.map((p, i) => ({ text: p.text, src: img('p' + pad(i + 1)) })),
  ];

  app.innerHTML = `
    <main class="reader" style="${paletteStyle(book.palette)}">
      <div class="stage"></div>
      <a class="close" href="#/" aria-label="חזרה לספרים">✕</a>
      <span class="counter"></span>
      <button class="nav prev" aria-label="העמוד הקודם">›</button>
      <button class="nav next" aria-label="העמוד הבא">‹</button>
    </main>`;

  const root = app.querySelector('.reader');
  const stage = root.querySelector('.stage');
  const counter = root.querySelector('.counter');
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  const key = `page:${id}`;
  const last = pages.length; // index of the "the end" screen
  let idx = Math.min(Number(store.get(key)) || 0, last - 1);

  const pageEl = (i) => {
    const el = document.createElement('div');
    if (i === last) {
      el.className = 'page end';
      el.innerHTML = `<p>לילה טוב 🌙</p>
        <div class="end-actions">
          <button class="btn" data-again>לקרוא שוב</button>
          <a class="btn" href="#/">חזרה לספרים</a>
        </div>`;
      return el;
    }
    const p = pages[i];
    el.className = 'page' + (p.cover ? ' is-cover' : '');
    const text = esc(p.text).replace(/\n/g, '<br>');
    el.innerHTML = `${book.hasArt ? `<img alt="" draggable="false" src="${p.src}">` : ''}
      <div class="band">${text}${p.sub ? `<small>${esc(p.sub)}</small>` : ''}</div>`;
    return el;
  };

  const show = (i, dir = 0) => {
    const old = stage.querySelector('.page:not(.leave)');
    const el = pageEl(i);
    if (old && dir) {
      el.style.setProperty('--dir', dir);
      old.style.setProperty('--dir', dir);
      el.classList.add('enter');
      old.classList.add('leave');
      old.addEventListener('animationend', () => old.remove(), { once: true });
      setTimeout(() => old.remove(), 500);
    } else if (old) {
      old.remove();
    }
    stage.append(el);
    idx = i;
    store.set(key, i === last ? 0 : i);
    counter.textContent = i === 0 || i === last ? '' : `${i} / ${last - 1}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === last;
    if (book.hasArt && pages[i + 1]) new Image().src = pages[i + 1].src;
  };

  // Hebrew book: the next page is on the left.
  const go = (step) => {
    const to = idx + step;
    if (to < 0 || to > last) return;
    show(to, step);
  };

  prevBtn.onclick = () => go(-1);
  nextBtn.onclick = () => go(1);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-again]')) show(0, -1);
  });

  let startX = null;
  let startY = 0;
  root.addEventListener('pointerdown', (e) => {
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
      const x = e.clientX / innerWidth;
      if (x < 0.3) go(1);
      else if (x > 0.7) go(-1);
    }
  });
  root.addEventListener('pointercancel', () => (startX = null));

  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === ' ') go(1);
    else if (e.key === 'ArrowRight') go(-1);
    else if (e.key === 'Escape') location.hash = '#/';
  };
  addEventListener('keydown', onKey);
  reader = () => removeEventListener('keydown', onKey);

  show(idx);
  if (book.hasArt) saveOffline(pages.map((p) => p.src));
}

// Keep every page of an opened book on the phone.
async function saveOffline(urls) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open('books-v1');
    for (const url of urls) {
      if (!(await cache.match(url))) await cache.add(url).catch(() => {});
    }
  } catch {}
}

// ---------- Router ----------

function route() {
  reader?.();
  reader = null;
  const hash = location.hash.slice(1) || '/';
  const m = hash.match(/^\/book\/([\w-]+)$/);
  if (m) openBook(m[1]);
  else if (hash === '/help') showHelp();
  else showLibrary();
  scrollTo(0, 0);
}

addEventListener('hashchange', route);
route();

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

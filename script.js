/* =========================================================
   OMBAR NEWS — Raja Ampat & Beyond
   script.js
   Vanilla JavaScript. CMS-ready: replace ARTICLES with a
   REST API / CMS fetch later.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. DATA — loaded from data-store.js (OMBAR_DATA).
        Admin edits (saved to localStorage) are reflected here.
     --------------------------------------------------------- */
  const CATEGORIES = window.OMBAR_DATA.getCategories();
  const SETTINGS = window.OMBAR_DATA.getSettings();
  const IMG = window.OMBAR_DATA.IMG;
  let ARTICLES = window.OMBAR_DATA.getArticles();

  /* Resolve image path → base64 data URI if available (hosting-proof).
     Ensures images ALWAYS display even when the images/ folder is missing
     on the hosting (e.g. Cloudflare Workers, partial upload). */
  function rImg(path) { return window.OMBAR_DATA.resolveImage(path); }

  /* =========================================================
     Article sharing — full article encoded in URL.
     This makes share links work on ANY device (iPhone, Android,
     desktop) WITHOUT needing a backend, GitHub token, or JSON upload.
     The article data travels WITH the link itself.
     ========================================================= */
  function encodeArticleToURL(a) {
    try {
      var copy = {
        i: a.id, c: a.category, t: a.title, e: a.excerpt,
        m: a.image, a: a.author, p: a.publishedAt,
        g: a.tags, f: a.featured, n: a.content
      };
      var json = JSON.stringify(copy);
      var b64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html#a=' + b64;
    } catch (e) { return null; }
  }
  function decodeArticleFromURL() {
    try {
      var h = location.hash || '';
      var m = h.match(/[#&]a=([A-Za-z0-9_-]+)/);
      if (!m) {
        // Also support short format #article=ID (for default articles)
        var m2 = h.match(/[#&]article=([^&]+)/);
        if (m2) return { id: decodeURIComponent(m2[1]) };
        return null;
      }
      var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var copy = JSON.parse(decodeURIComponent(escape(atob(b64))));
      // Expand short keys back to full names
      return {
        id: copy.i, category: copy.c, title: copy.t, excerpt: copy.e,
        image: copy.m, author: copy.a, publishedAt: copy.p,
        tags: copy.g || [], featured: copy.f || false, content: copy.n || [],
        reads: 0, updatedAt: copy.p
      };
    } catch (e) { return null; }
  }

  /* =========================================================
     URL Shortener — makes share links SHORT (~30 chars) so they
     work nicely on WhatsApp, SMS, Twitter, etc. Uses free public
     APIs (is.gd + TinyURL fallback) — no API key needed.
     Falls back to the long URL if shortener fails.
     ========================================================= */
  function shortenURL(longURL) {
    // TinyURL first (preserves hash fragment on redirect, works reliably).
    // is.gd as fallback. Both are free, no API key needed.
    return fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(longURL))
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (text) {
        if (text && text.indexOf('http') === 0) return text.trim();
        // Fallback: is.gd (simple format)
        return fetch('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(longURL))
          .then(function (r) { return r.ok ? r.text() : null; })
          .then(function (t) { return t && t.indexOf('http') === 0 ? t.trim() : null; });
      })
      .catch(function () { return null; });
  }

  /* ---------------------------------------------------------
     1b. APPLY SITE SETTINGS (site name, tagline, description) —
     reflects admin edits on the public site.
     --------------------------------------------------------- */
  function applySettings() {
    const s = SETTINGS || {};
    if (s.siteName) {
      document.title = `${s.siteName} — ${s.tagline || ''}`.trim();
      $$('.brand__main').forEach(el => el.textContent = s.siteName.split(' ')[0] || 'OMBAR');
      const ogTitle = document.querySelector('meta[property="og:site_name"]');
      if (ogTitle) ogTitle.setAttribute('content', s.siteName);
    }
    if (s.tagline) {
      $$('.footer__tagline').forEach(el => el.textContent = s.tagline);
    }
    if (s.description) {
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', s.description);
      const ogd = document.querySelector('meta[property="og:description"]');
      if (ogd) ogd.setAttribute('content', s.description);
    }
    if (s.footerAbout) {
      $$('.footer__about').forEach(el => el.textContent = s.footerAbout);
    }
    if (s.breakingLabel) {
      const badge = $('.ticker__badge');
      if (badge) {
        const dot = badge.querySelector('.ticker__dot');
        badge.textContent = s.breakingLabel;
        if (dot) badge.prepend(dot);
      }
    }
  }

  /* ---------------------------------------------------------
     2. HELPERS
     --------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');

  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  function fmtDateTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${fmtDate(iso)}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIT`;
  }
  function timeAgo(iso) {
    const d = new Date(iso); const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff/86400)} hari lalu`;
    return fmtDate(iso);
  }
  function initials(name) {
    return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  }
  function catName(cat) { return (CATEGORIES[cat] || {}).name || cat; }
  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function byDateDesc(a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); }
  function byReadsDesc(a, b) { return b.reads - a.reads; }

  const store = {
    get(key, fb) { try { const v = localStorage.getItem(key); return v === null ? fb : JSON.parse(v); } catch { return fb; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
  };

  /* ---------------------------------------------------------
     3. THEME (dark mode)
     --------------------------------------------------------- */
  function initTheme() {
    const saved = store.get('ombar-theme', null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
    $$('[data-theme-toggle], #themeToggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    });
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    store.set('ombar-theme', theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#07101F' : '#0A1A2F');
  }

  /* ---------------------------------------------------------
     4. CURRENT DATE / TIME (top bar + ticker date)
     --------------------------------------------------------- */
  function tickClock() {
    const el = $('#topbarDate');
    if (!el) return;
    const d = new Date();
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    el.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} • ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIT`;
  }

  /* ---------------------------------------------------------
     5. MOBILE NAV
     --------------------------------------------------------- */
  function initMobileNav() {
    const nav = $('#mobileNav');
    const overlay = $('#overlay');
    const openers = [$('#hamburger'), $('#hamburgerAlt')].filter(Boolean);
    const closer = $('#mobileNavClose');

    // populate list
    const list = $('#mobileNavList');
    if (list) {
      const items = [
        { label: 'Home', nav: 'home' },
        { label: 'Raja Ampat', cat: 'raja-ampat' },
        { label: 'Papua Barat Daya', cat: 'papua-barat-daya' },
        { label: 'Papua', cat: 'papua' },
        { label: 'National', cat: 'national' },
        { label: 'World', cat: 'world' },
        { label: 'Politics', cat: 'politics' },
        { label: 'Economy', cat: 'economy' },
        { label: 'Sports', cat: 'sports' },
        { label: 'Culture', cat: 'culture' },
        { label: 'Travel', cat: 'travel' }
      ];
      list.innerHTML = items.map(it =>
        it.nav
          ? `<a href="#" data-nav="${it.nav}">${it.label}</a>`
          : `<a href="#" data-cat="${it.cat}">${it.label}</a>`
      ).join('');
    }

    function open() {
      nav.classList.add('is-open');
      overlay.classList.add('is-open');
      nav.setAttribute('aria-hidden','false');
      openers.forEach(b => b && b.setAttribute('aria-expanded','true'));
      document.body.style.overflow = 'hidden';
    }
    function close() {
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      nav.setAttribute('aria-hidden','true');
      openers.forEach(b => b && b.setAttribute('aria-expanded','false'));
      document.body.style.overflow = '';
    }
    openers.forEach(b => b && b.addEventListener('click', open));
    closer && closer.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); closeSearch(); } });
    nav._close = close;
  }

  /* ---------------------------------------------------------
     6. SEARCH OVERLAY
     --------------------------------------------------------- */
  function initSearch() {
    const overlay = $('#searchOverlay');
    const btn = $('#searchBtn');
    const close = $('#searchClose');
    const input = $('#searchInput');
    const results = $('#searchResults');
    const hint = $('#searchHint');

    function open() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 120);
    }
    function closeFn() { closeSearch(); }
    btn && btn.addEventListener('click', open);
    close && close.addEventListener('click', closeFn);
    window._closeSearch = closeFn;

    let timer;
    input && input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderSearchLive(input.value.trim()), 180);
    });
    input && input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = input.value.trim();
        if (q.length >= 2) { closeFn(); goSearch(q); }
      }
    });

    function renderSearchLive(q) {
      if (q.length < 2) {
        results.innerHTML = '';
        hint.hidden = false;
        return;
      }
      hint.hidden = true;
      const matches = searchArticles(q).slice(0, 6);
      if (!matches.length) {
        results.innerHTML = `<p class="search-overlay__section-title">Tidak ada hasil untuk "${esc(q)}"</p>`;
        return;
      }
      results.innerHTML = `<p class="search-overlay__section-title">${matches.length} hasil ditemukan</p>` +
        matches.map(miniCardHTML).join('');
      bindArticleLinks(results);
    }
  }
  function closeSearch() {
    const overlay = $('#searchOverlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    if (!$('#mobileNav').classList.contains('is-open')) document.body.style.overflow = '';
  }
  function searchArticles(q) {
    const ql = q.toLowerCase();
    return ARTICLES.filter(a =>
      a.title.toLowerCase().includes(ql) ||
      a.excerpt.toLowerCase().includes(ql) ||
      a.tags.some(t => t.toLowerCase().includes(ql)) ||
      catName(a.category).toLowerCase().includes(ql) ||
      a.author.toLowerCase().includes(ql)
    );
  }

  /* ---------------------------------------------------------
     7. RENDER: card templates
     --------------------------------------------------------- */
  function miniCardHTML(a) {
    return `
      <a class="mini-card" href="#" data-article="${a.id}">
        <div class="mini-card__media"><img src="${rImg(a.image)}" alt="${esc(a.title)}" loading="lazy" /></div>
        <div class="mini-card__body">
          <span class="cat-badge" data-cat="${a.category}">${catName(a.category)}</span>
          <h3 class="mini-card__title">${esc(a.title)}</h3>
          <div class="mini-card__meta"><span>${timeAgo(a.publishedAt)}</span> <span>•</span> <span>${a.reads.toLocaleString('id-ID')} baca</span></div>
        </div>
      </a>`;
  }
  function newsCardHTML(a) {
    return `
      <article class="news-card reveal">
        <a class="news-card__media" href="#" data-article="${a.id}">
          <img src="${rImg(a.image)}" alt="${esc(a.title)}" loading="lazy" />
          <span class="cat-badge" data-cat="${a.category}">${catName(a.category)}</span>
        </a>
        <div class="news-card__body">
          <h3 class="news-card__title"><a href="#" data-article="${a.id}">${esc(a.title)}</a></h3>
          <p class="news-card__excerpt">${esc(a.excerpt)}</p>
          <div class="news-card__meta">
            <span class="news-card__author">${esc(a.author)}</span>
            <span class="dot"></span>
            <span>${fmtDate(a.publishedAt)}</span>
          </div>
        </div>
      </article>`;
  }
  function listCardHTML(a) {
    return `
      <a class="list-card" href="#" data-article="${a.id}">
        <div class="list-card__media"><img src="${rImg(a.image)}" alt="${esc(a.title)}" loading="lazy" /></div>
        <div class="list-card__body">
          <span class="cat-badge" data-cat="${a.category}">${catName(a.category)}</span>
          <h4 class="list-card__title">${esc(a.title)}</h4>
          <div class="list-card__meta">${timeAgo(a.publishedAt)} • ${a.reads.toLocaleString('id-ID')} baca</div>
        </div>
      </a>`;
  }

  /* ---------------------------------------------------------
     8. RENDER: home page sections
     --------------------------------------------------------- */
  function renderHome() {
    const sorted = [...ARTICLES].sort(byDateDesc);
    // HERO main (featured)
    const featured = sorted.find(a => a.featured) || sorted[0];
    const heroMain = $('#heroMain');
    if (heroMain) {
      heroMain.innerHTML = `
        <img src="${rImg(featured.image)}" alt="${esc(featured.title)}" />
        <div class="hero__main-content">
          <span class="cat-badge" data-cat="${featured.category}">${catName(featured.category)}</span>
          <h1 class="hero__main-title">${esc(featured.title)}</h1>
          <p class="hero__main-excerpt">${esc(featured.excerpt)}</p>
          <div class="hero__meta">
            <span>${esc(featured.author)}</span>
            <span class="dot"></span>
            <span>${fmtDateTime(featured.publishedAt)}</span>
          </div>
          <div style="margin-top:18px;">
            <a class="btn btn--ghost" href="#" data-article="${featured.id}">Read More
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </div>`;
    }
    // HERO side — popular now (by reads)
    const side = $('#heroSideList');
    if (side) {
      const popular = [...ARTICLES].sort(byReadsDesc).slice(0, 3);
      side.innerHTML = popular.map(miniCardHTML).join('');
    }
    // Latest grid
    const latest = $('#latestGrid');
    if (latest) {
      latest.innerHTML = sorted.slice(1, 9).map(newsCardHTML).join('');
    }
    // Raja Ampat section
    const raja = ARTICLES.filter(a => a.category === 'raja-ampat' && a.id !== featured.id);
    const rajaMain = $('#rajaMain');
    const rajaList = $('#rajaList');
    if (rajaMain && raja[0]) {
      const top = raja[0];
      rajaMain.innerHTML = `
        <a class="feature-card" href="#" data-article="${top.id}">
          <img src="${rImg(top.image)}" alt="${esc(top.title)}" loading="lazy" />
          <div class="feature-card__content">
            <span class="cat-badge" data-cat="${top.category}">${catName(top.category)}</span>
            <h3 class="feature-card__title">${esc(top.title)}</h3>
            <p class="feature-card__excerpt">${esc(top.excerpt)}</p>
            <div class="hero__meta" style="margin-top:12px;">
              <span>${esc(top.author)}</span><span class="dot"></span><span>${timeAgo(top.publishedAt)}</span>
            </div>
          </div>
        </a>`;
    }
    if (rajaList) {
      rajaList.innerHTML = raja.slice(1, 5).map(listCardHTML).join('');
    }
    // Papua Barat Daya
    const pbdGrid = $('#pbdGrid');
    if (pbdGrid) {
      const pbd = ARTICLES.filter(a => a.category === 'papua-barat-daya').slice(0, 3);
      pbdGrid.innerHTML = pbd.map(newsCardHTML).join('');
    }
    // National & World
    const natGrid = $('#nationalGrid');
    if (natGrid) {
      const nat = ARTICLES.filter(a => a.category === 'national' || a.category === 'politics').slice(0, 4);
      natGrid.innerHTML = (nat.length ? nat : sorted.slice(0,4)).map(newsCardHTML).join('');
    }
    const worldGrid = $('#worldGrid');
    if (worldGrid) {
      const world = ARTICLES.filter(a => a.category === 'world' || a.category === 'economy').slice(0, 4);
      worldGrid.innerHTML = (world.length ? world : sorted.slice(4,8)).map(newsCardHTML).join('');
    }
    // Trending Today
    const trend = $('#trendList');
    if (trend) {
      const t = [...ARTICLES].sort((a,b) => b.reads - a.reads).slice(0, 5);
      trend.innerHTML = t.map(a => `
        <li class="trend-item" data-article="${a.id}">
          <div class="trend-item__body">
            <div class="trend-item__title">${esc(a.title)}</div>
            <div class="trend-item__meta">${catName(a.category)} • ${a.reads.toLocaleString('id-ID')} baca</div>
          </div>
        </li>`).join('');
    }
    // Most Read
    const mr = $('#mostReadList');
    if (mr) {
      const m = [...ARTICLES].sort(byReadsDesc).slice(0, 5);
      mr.innerHTML = m.map(a => `
        <li class="mostread-item" data-article="${a.id}">
          <span class="mostread-item__title">${esc(a.title)}</span>
        </li>`).join('');
    }
    // Photo grid (OMBAR PHOTO)
    const photo = $('#photoGrid');
    if (photo) {
      const photos = [
        { img: 'hero-rajaampat.jpg', cat: 'raja-ampat', cap: 'Gugusan karst Raja Ampat dari udara', big: true },
        { img: 'wayag-viewpoint.jpg', cat: 'travel', cap: 'Panorama Wayag di matahari terbenam' },
        { img: 'coral-reef.jpg', cat: 'raja-ampat', cap: 'Terumbu kaledoskop di bawah laut' },
        { img: 'local-village.jpg', cat: 'culture', cap: 'Kampung apung masyarakat adat' },
        { img: 'manta-ray.jpg', cat: 'travel', cap: 'Pertemuan dengan hiu paus' }
      ];
      photo.innerHTML = photos.map(p => `
        <figure class="photo-card ${p.big ? 'photo-card--big' : ''}" data-article="${pickArticleForImage(p.img)}">
          <img src="${rImg(IMG + p.img)}" alt="${esc(p.cap)}" loading="lazy" />
          <figcaption class="photo-card__cap">
            <span class="cat-badge" data-cat="${p.cat}">${catName(p.cat)}</span>
            <h3>${esc(p.cap)}</h3>
          </figcaption>
        </figure>`).join('');
    }
    // Video grid (OMBAR VIDEO)
    const video = $('#videoGrid');
    if (video) {
      const vids = [
        { img: 'wayag-viewpoint.jpg', cat: 'raja-ampat', title: 'Menyusuri Wayag dari atas awan', dur: '4:32', big: true },
        { img: 'coral-reef.jpg', cat: 'travel', title: 'Menyelam di jantung biodiversitas', dur: '6:18' },
        { img: 'papuan-culture.jpg', cat: 'culture', title: 'Festival Bahari Raja Ampat 2026', dur: '3:45' },
        { img: 'manta-ray.jpg', cat: 'raja-ampat', title: 'Beruang dengan hiu paus', dur: '5:02' }
      ];
      video.innerHTML = vids.map(v => `
        <div class="video-card ${v.big ? 'video-card--big' : ''}" data-article="${pickArticleForImage(v.img)}">
          <img src="${rImg(IMG + v.img)}" alt="${esc(v.title)}" loading="lazy" />
          <span class="video-card__dur">${v.dur}</span>
          <button class="video-card__play" aria-label="Putar video">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="video-card__cap">
            <span class="cat-badge" data-cat="${v.cat}">${catName(v.cat)}</span>
            <h3>${esc(v.title)}</h3>
          </div>
        </div>`).join('');
    }

    bindArticleLinks(document);
    observeReveal();
  }
  function pickArticleForImage(img) {
    const a = ARTICLES.find(x => x.image.endsWith(img));
    return a ? a.id : ARTICLES[0].id;
  }

  /* ---------------------------------------------------------
     9. BREAKING TICKER
     --------------------------------------------------------- */
  function renderTicker() {
    const track = $('#tickerTrack');
    if (!track) return;
    const customBreaking = window.OMBAR_DATA.getBreaking() || [];
    const latest = [...ARTICLES].sort(byDateDesc).slice(0, 8);
    const items = [];
    customBreaking.forEach(text => items.push(`<span class="ticker__item"><b>NEWS</b> ${esc(text)}</span>`));
    latest.forEach(a => items.push(`<span class="ticker__item"><b>${catName(a.category)}</b> ${esc(a.title)}</span>`));
    if (!items.length) { track.innerHTML = ''; return; }
    const inner = items.join('<span style="color:#3A5A7A">•</span>');
    // duplicate for seamless loop
    track.innerHTML = `<div class="ticker__track-inner">${inner}${inner}</div>`;
  }

  /* ---------------------------------------------------------
     10. TABS (National / World)
     --------------------------------------------------------- */
  function initTabs() {
    const tabs = $$('#natWorldTabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('tab--active'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('tab--active');
        tab.setAttribute('aria-selected','true');
        const id = tab.dataset.tab;
        $$('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
        const panel = $('#panel-' + id);
        if (panel) panel.classList.add('tab-panel--active');
      });
    });
  }

  /* ---------------------------------------------------------
     11. ROUTING (home / article / category / search)
     --------------------------------------------------------- */
  function showView(name) {
    const views = ['Home','Article','Category','Search'];
    views.forEach(v => {
      const el = $('#view' + v);
      if (!el) return;
      if (v.toLowerCase() === name) {
        el.classList.remove('view--hidden');
        el.setAttribute('aria-hidden','false');
      } else {
        el.classList.add('view--hidden');
        el.setAttribute('aria-hidden','true');
      }
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    // sync nav active
    $$('.nav__link').forEach(l => l.classList.remove('is-active'));
  }

  function goHome() {
    showView('home');
    document.title = 'OMBAR NEWS — Raja Ampat & Beyond';
    $$('.nav__link[data-nav="home"]').forEach(l => l.classList.add('is-active'));
  }
  function goArticle(id) {
    // First check local articles (defaults + localStorage edits)
    let a = ARTICLES.find(x => x.id === id);
    // If not found locally, try to decode from URL hash (shared article)
    if (!a) {
      const shared = decodeArticleFromURL();
      if (shared && shared.id === id) { a = shared; }
    }
    if (!a) { toast('Artikel tidak ditemukan'); goHome(); return; }
    renderArticle(a);
    showView('article');
    document.title = `${a.title} — OMBAR NEWS`;
  }
  function goCategory(cat) {
    const meta = CATEGORIES[cat] || { name: cat, desc: '' };
    $('#catTitle').textContent = meta.name;
    $('#catDesc').textContent = meta.desc;
    $('#catCrumbCurrent').textContent = meta.name;
    const list = ARTICLES.filter(a => a.category === cat).sort(byDateDesc);
    const grid = $('#catGrid');
    const empty = $('#catEmpty');
    if (list.length) {
      grid.innerHTML = list.map(newsCardHTML).join('');
      empty.hidden = true;
    } else {
      grid.innerHTML = '';
      empty.hidden = false;
    }
    showView('category');
    document.title = `${meta.name} — OMBAR NEWS`;
    $$('.nav__link[data-cat="'+cat+'"]').forEach(l => l.classList.add('is-active'));
    bindArticleLinks(grid);
    observeReveal();
  }
  function goSearch(q) {
    const list = searchArticles(q);
    $('#searchViewTitle').textContent = `Hasil Pencarian: "${q}"`;
    $('#searchViewDesc').textContent = list.length ? `${list.length} artikel ditemukan.` : 'Tidak ada artikel yang cocok. Coba kata kunci lain.';
    const grid = $('#searchViewGrid');
    const empty = $('#searchViewEmpty');
    if (list.length) {
      grid.innerHTML = list.map(newsCardHTML).join('');
      empty.hidden = true;
    } else {
      grid.innerHTML = '';
      empty.hidden = false;
    }
    showView('search');
    document.title = `Cari: ${q} — OMBAR NEWS`;
    bindArticleLinks(grid);
    observeReveal();
  }

  /* ---------------------------------------------------------
     12. ARTICLE RENDER
     --------------------------------------------------------- */
  function renderArticle(a) {
    const container = $('#articleContainer');
    // Related = same category (excluding current); Latest = newest overall (excluding current)
    const related = ARTICLES.filter(x => x.id !== a.id && x.category === a.category).sort(byDateDesc).slice(0, 4);
    const relatedFill = related.length < 4
      ? [...ARTICLES].filter(x => x.id !== a.id && x.category !== a.category).sort(byDateDesc).slice(0, 4 - related.length)
      : [];
    const relatedFinal = [...related, ...relatedFill];
    const latest = [...ARTICLES].filter(x => x.id !== a.id).sort(byDateDesc).slice(0, 4);

    const contentHTML = a.content.map(block => {
      switch (block.type) {
        case 'h2': return `<h2>${esc(block.text)}</h2>`;
        case 'h3': return `<h3>${esc(block.text)}</h3>`;
        case 'blockquote': return `<blockquote><p>${esc(block.text)}</p>${block.cite ? `<cite>— ${esc(block.cite)}</cite>` : ''}</blockquote>`;
        case 'p': return `<p>${esc(block.text)}</p>`;
        default: return '';
      }
    }).join('');

    const shareURL = encodeArticleToURL(a) || (location.origin + location.pathname + '#' + a.id);
    container.innerHTML = `
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#" data-nav="home">Home</a>
          <span class="breadcrumb__sep">/</span>
          <a href="#" data-cat="${a.category}">${catName(a.category)}</a>
          <span class="breadcrumb__sep">/</span>
          <span>${esc(a.title).slice(0,40)}${a.title.length>40?'…':''}</span>
        </nav>
      </div>
      <div class="container">
        <div class="article-layout">
          <div class="article-layout__main">
            <div class="article__wrap">
              <div class="article__cat"><span class="cat-badge" data-cat="${a.category}">${catName(a.category)}</span></div>
              <h1 class="article__title">${esc(a.title)}</h1>
              <p class="article__subtitle">${esc(a.excerpt)}</p>
              <div class="article__byline">
                <div class="article__author">
                  <div class="article__avatar">${initials(a.author)}</div>
                  <div>
                    <div class="article__author-name">${esc(a.author)}</div>
                    <div class="article__author-role">Jurnalis OMBAR NEWS</div>
                  </div>
                </div>
                <div class="article__dates">
                  <div><b>Dipublikasikan:</b> ${fmtDateTime(a.publishedAt)}</div>
                  <div><b>Diperbarui:</b> ${fmtDateTime(a.updatedAt || a.publishedAt)}</div>
                </div>
                <div class="article__share" id="shareTop">
                  <span>Bagikan</span>
                  <span class="share-loading" id="shareLoading">⏳ memendekkan…</span>
                  <a class="share-btn" data-share="fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}" target="_blank" rel="noopener" aria-label="Bagikan ke Facebook"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z"/></svg></a>
                  <a class="share-btn" data-share="tw" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareURL)}&text=${encodeURIComponent(a.title)}" target="_blank" rel="noopener" aria-label="Bagikan ke X"><svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.2L4.5 21H1.5l7.4-8.5L1 3h6.6l4.5 5.6L17.5 3z"/></svg></a>
                  <a class="share-btn" data-share="wa" href="https://wa.me/?text=${encodeURIComponent(a.title+' '+shareURL)}" target="_blank" rel="noopener" aria-label="Bagikan ke WhatsApp"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.1 14.9l-.3-.2-2.5.7.7-2.4-.2-.3A8 8 0 0112 4zm-2.7 4c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2 .8 2.4.6 2.9.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.2-1.4-.5-.5-.9-1.1-1-1.3-.1-.2 0-.4.1-.5l.4-.4c.1-.2.1-.3.2-.5 0-.1 0-.3-.1-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4z"/></svg></a>
                  <button class="share-btn" data-copy="${shareURL}" aria-label="Salin tautan"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11 7M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7L13 17"/></svg></button>
                </div>
              </div>
              <figure class="article__featured">
                <img src="${rImg(a.image)}" alt="${esc(a.title)}" />
                <figcaption class="article__caption">${esc(a.title)} — Foto: OMBAR News/${esc(a.author)}</figcaption>
              </figure>

              <script type="application/ld+json">
              ${JSON.stringify({
                "@context":"https://schema.org",
                "@type":"NewsArticle",
                "headline": a.title,
                "description": a.excerpt,
                "image": a.image,
                "datePublished": a.publishedAt,
                "dateModified": a.updatedAt || a.publishedAt,
                "author": { "@type":"Person", "name": a.author },
                "publisher": { "@type":"Organization", "name":"OMBAR NEWS" },
                "articleSection": catName(a.category)
              })}
              <\/script>

              <div class="article__content">
                ${contentHTML}
              </div>

              <div class="article__tags">
                ${a.tags.map(t => `<a class="tag-pill" href="#" data-search="${esc(t)}">#${esc(t)}</a>`).join('')}
              </div>

              <div class="article__share-bottom">
                <span style="font-family:var(--font-label);text-transform:uppercase;letter-spacing:1px;font-size:12px;color:var(--text-mute)">Bagikan artikel</span>
                <span class="share-loading" id="shareLoadingBottom">⏳ memendekkan…</span>
                <a class="share-btn" data-share="fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z"/></svg></a>
                <a class="share-btn" data-share="tw" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareURL)}&text=${encodeURIComponent(a.title)}" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.2L4.5 21H1.5l7.4-8.5L1 3h6.6l4.5 5.6L17.5 3z"/></svg></a>
                <a class="share-btn" data-share="wa" href="https://wa.me/?text=${encodeURIComponent(a.title+' '+shareURL)}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.1 14.9l-.3-.2-2.5.7.7-2.4-.2-.3A8 8 0 0112 4z"/></svg></a>
                <button class="share-btn" data-copy="${shareURL}" aria-label="Salin tautan"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11 7M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7L13 17"/></svg></button>
              </div>
            </div>
          </div>

          <aside class="article-layout__side" aria-label="Artikel terkait">
            <div class="side-widget">
              <h3 class="side-widget__title">Related Articles</h3>
              ${relatedFinal.map(listCardHTML).join('')}
            </div>
            <div class="side-widget">
              <h3 class="side-widget__title">Latest News</h3>
              ${latest.map(listCardHTML).join('')}
            </div>
          </aside>
        </div>
      </div>`;

    bindArticleLinks(container);
    // copy link buttons
    $$('[data-copy]', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-copy');
        navigator.clipboard && navigator.clipboard.writeText(url).then(
          () => toast('Tautan disalin ke papan klip'),
          () => toast('Gagal menyalin tautan')
        );
      });
    });
    observeReveal();

    // Auto-shorten the share URL (so links are short for WhatsApp/SMS/Twitter).
    // Uses free is.gd / TinyURL APIs — no API key. Falls back to long URL.
    if (shareURL && shareURL.indexOf('#a=') >= 0) {
      shortenURL(shareURL).then(function (short) {
        if (!short) {
          // Shortener failed — hide loading, keep long URL.
          var l1 = document.getElementById('shareLoading'); if (l1) l1.remove();
          var l2 = document.getElementById('shareLoadingBottom'); if (l2) l2.remove();
          return;
        }
        // Update all share buttons to use the short URL.
        $$('[data-share="fb"]', container).forEach(function (el) {
          el.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(short);
        });
        $$('[data-share="tw"]', container).forEach(function (el) {
          el.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(short) + '&text=' + encodeURIComponent(a.title);
        });
        $$('[data-share="wa"]', container).forEach(function (el) {
          el.href = 'https://wa.me/?text=' + encodeURIComponent(a.title + ' ' + short);
        });
        $$('[data-copy]', container).forEach(function (el) {
          el.setAttribute('data-copy', short);
        });
        // Hide loading indicators
        var l1 = document.getElementById('shareLoading'); if (l1) l1.remove();
        var l2 = document.getElementById('shareLoadingBottom'); if (l2) l2.remove();
      });
    } else {
      // Default article (not base64) — no need to shorten, hide loading.
      var l1 = document.getElementById('shareLoading'); if (l1) l1.remove();
      var l2 = document.getElementById('shareLoadingBottom'); if (l2) l2.remove();
    }
  }

  /* ---------------------------------------------------------
     13. EVENT DELEGATION (links)
     --------------------------------------------------------- */
  function bindArticleLinks(root) {
    $$('[data-article]', root).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const id = el.getAttribute('data-article');
        if (id) goArticle(id);
      });
    });
    $$('[data-cat]', root).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = el.getAttribute('data-cat');
        if (cat) goCategory(cat);
      });
    });
    $$('[data-nav]', root).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        goHome();
      });
    });
    $$('[data-search]', root).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        goSearch(el.getAttribute('data-search'));
      });
    });
    $$('[data-action="subscribe"]', root).forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const nl = $('#newsletter');
        if (nl) nl.scrollIntoView({ behavior: 'smooth' });
        const input = $('#newsletterEmail');
        if (input) setTimeout(() => input.focus(), 600);
      });
    });
  }

  /* ---------------------------------------------------------
     14. STICKY HEADER + BACK TO TOP + REVEAL
     --------------------------------------------------------- */
  function initScroll() {
    const header = $('#header');
    const topbar = $('#topbar');
    const backTop = $('#backToTop');
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      if (header) {
        if (y > 8) header.classList.add('is-stuck'); else header.classList.remove('is-stuck');
        if (y > lastY + 6 && y > 220) header.classList.add('is-hidden');
        else if (y < lastY - 6) header.classList.remove('is-hidden');
      }
      if (backTop) {
        if (y > 400) backTop.classList.add('is-show'); else backTop.classList.remove('is-show');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  let revealObserver;
  function observeReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            revealObserver.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -40px', threshold: 0.08 });
      // Safety fallback: reveal everything shortly after load so content is
      // never stuck invisible (e.g. full-page captures, slow observers, or
      // elements that never enter the viewport).
      setTimeout(() => {
        $$('.reveal:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
      }, 1200);
    }
    $$('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     15. NEWSLETTER FORM
     --------------------------------------------------------- */
  function initNewsletter() {
    const form = $('#newsletterForm');
    const note = $('#newsletterNote');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletterEmail').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = 'Mohon masukkan alamat email yang valid.';
        note.style.color = '#ffb4b4';
        return;
      }
      note.textContent = 'Terima kasih! Anda berhasil berlangganan OMBAR NEWS.';
      note.style.color = '';
      form.reset();
      toast('Selamat! Anda berlangganan OMBAR NEWS.');
    });
  }

  /* ---------------------------------------------------------
     16. TOAST
     --------------------------------------------------------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 3000);
  }

  /* ---------------------------------------------------------
     17. YEAR
     --------------------------------------------------------- */
  function setYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     18. INIT
     --------------------------------------------------------- */
  function init() {
    initTheme();
    initImageFallback();
    tickClock();
    setInterval(tickClock, 1000);
    initMobileNav();
    initSearch();
    bindArticleLinks(document);

    // Wait for published data (ombar-data.json) to load, THEN render.
    // This ensures articles posted via admin (and exported to JSON) are
    // visible to ALL visitors on any device.
    window.OMBAR_DATA.loadPublished().then(function () {
      // Reload data now that JSON may have provided new defaults.
      ARTICLES = window.OMBAR_DATA.getArticles();
      // Re-apply settings (in case JSON had updated settings).
      applySettings();
      renderTicker();
      renderHome();
      initTabs();
      initScroll();
      initNewsletter();
      setYear();

      // On page load: if URL contains a shared article (#article=ID or
      // #a=base64), open it directly.
      const shared = decodeArticleFromURL();
      if (shared && shared.id) {
        goArticle(shared.id);
      } else {
        goHome();
      }

      // Hide loading overlay now that content is rendered.
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('is-hidden');
    });

    // Live sync: if admin edits in another tab, reload this public page so
    // visitors (the admin) instantly see updated content.
    window.addEventListener('storage', (e) => {
      if (e.key === window.OMBAR_DATA.KEYS.DATA) {
        location.reload();
      }
    });
  }

  /* ---------------------------------------------------------
     19. IMAGE FALLBACK — graceful themed placeholder when an
     image fails to load (e.g. images/ folder not uploaded to
     hosting). Replaces broken <img> with a wave-themed SVG so
     the site still looks professional instead of showing
     broken-image icons.
     --------------------------------------------------------- */
  const PLACEHOLDER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#0A1A2F'/>
        <stop offset='50%' stop-color='#12345C'/>
        <stop offset='100%' stop-color='#0A6E8C'/>
      </linearGradient>
    </defs>
    <rect width='800' height='500' fill='url(#g)'/>
    <path d='M0 320c100 0 100-60 200-60s100 60 200 60 100-60 200-60 100 60 200 60v180H0z' fill='#06B6D4' opacity='.25'/>
    <path d='M0 360c100 0 100-50 200-50s100 50 200 50 100-50 200-50 100 50 200 50v140H0z' fill='#06B6D4' opacity='.4'/>
    <g transform='translate(400 210)' opacity='.9'>
      <path d='M-60 0c15 0 15-15 30-15s15 15 30 15 15-15 30-15 15 15 30 15' fill='none' stroke='#40E0D0' stroke-width='6' stroke-linecap='round'/>
      <path d='M-60 20c15 0 15-15 30-15s15 15 30 15 15-15 30-15 15 15 30 15' fill='none' stroke='#40E0D0' stroke-width='6' stroke-linecap='round' opacity='.6'/>
    </g>
    <text x='400' y='280' font-family='Inter,sans-serif' font-size='18' font-weight='600' fill='#9DB1C8' text-anchor='middle'>OMBAR NEWS</text>
    <text x='400' y='305' font-family='Inter,sans-serif' font-size='12' fill='#6F86A0' text-anchor='middle'>Raja Ampat &amp; Beyond</text>
  </svg>`;
  const PLACEHOLDER_DATA_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(PLACEHOLDER_SVG);

  function initImageFallback() {
    // Use capture phase — 'error' events from <img> don't bubble.
    document.addEventListener('error', function (e) {
      const el = e.target;
      if (!el || el.tagName !== 'IMG') return;
      // Already a placeholder → skip to avoid infinite loop.
      if (el.dataset.fallbackApplied === '1') return;
      el.dataset.fallbackApplied = '1';
      el.src = PLACEHOLDER_DATA_URI;
      el.classList.add('img-fallback');
      el.onerror = null;
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

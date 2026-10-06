/* ============================================
   DigiSakhi – Language Switcher
   GT toolbar fully suppressed, navbar stays on top
   ============================================ */

const LANG_KEY = 'digisakhi_lang';

const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'English',  flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी',    flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',  native: 'मराठी',     flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',    native: 'தமிழ்',     flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',   native: 'తెలుగు',    flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુజરાતી',   flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali',  native: 'বাংলা',     flag: '🇧🇩' },
];

/* ── 1. Inject CSS that hard-locks the GT bar away ── */
function injectHideStyles() {
  if (document.getElementById('gt-hide-style')) return;
  const s = document.createElement('style');
  s.id = 'gt-hide-style';
  s.textContent = `
    .goog-te-banner-frame,
    .goog-te-balloon-frame,
    .goog-te-ftab-frame,
    .skiptranslate,
    #goog-gt-tt,
    #goog-gt-vt,
    .goog-te-spinner-pos,
    .goog-te-gadget,
    .goog-te-gadget-simple,
    .goog-tooltip,
    .goog-tooltip-content,
    #google_translate_element,
    .VIpgJd-ZVi9od-l4eHX-hSRGPd,
    .VIpgJd-ZVi9od-SmfZ {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    body,
    body.translated-ltr,
    body.translated-rtl {
      top: 0 !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
      position: static !important;
    }
    .navbar { z-index: 99999 !important; }
  `;
  const head = document.head || document.getElementsByTagName('head')[0];
  head.insertBefore(s, head.firstChild);
}

/* ── 2. Kill the GT toolbar bar ── */
function killGTBar() {
  if (document.body) {
    document.body.style.setProperty('top',        '0px', 'important');
    document.body.style.setProperty('margin-top', '0px', 'important');
    document.body.style.setProperty('padding-top','0px', 'important');
  }
  document.querySelectorAll(
    '.goog-te-banner-frame, .skiptranslate, #goog-gt-tt, #goog-gt-vt'
  ).forEach(el => {
    if (el.id === 'google_translate_element') return;
    el.style.setProperty('display',    'none',   'important');
    el.style.setProperty('height',     '0',      'important');
    el.style.setProperty('max-height', '0',      'important');
    el.style.setProperty('overflow',   'hidden', 'important');
  });
}

/* ── 3. MutationObserver + polling to keep bar suppressed ── */
function watchBodyTop() {
  killGTBar();

  const attrObs = new MutationObserver(killGTBar);
  attrObs.observe(document.body, { attributes: true, attributeFilter: ['style','class'] });

  const childObs = new MutationObserver(killGTBar);
  childObs.observe(document.body, { childList: true, subtree: false });

  const htmlObs = new MutationObserver(killGTBar);
  htmlObs.observe(document.documentElement, { childList: true, subtree: false });

  let fast = setInterval(killGTBar, 300);
  setTimeout(() => { clearInterval(fast); setInterval(killGTBar, 1000); }, 10000);
}

/* ── 4. Clear all googtrans cookies ── */
function clearGTCookies() {
  const paths   = ['/', location.pathname];
  const domains = ['', location.hostname, '.' + location.hostname];
  paths.forEach(p => {
    domains.forEach(d => {
      const dStr = d ? `; domain=${d}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${dStr}`;
    });
  });
}

/* ── 5. Apply a language via GT's hidden select ── */
function applyGTLang(code) {
  const tryApply = (attempts) => {
    const sel = document.querySelector('#google_translate_element select');
    if (sel) {
      sel.value = code;
      sel.dispatchEvent(new Event('change'));
      setTimeout(killGTBar, 200);
      setTimeout(killGTBar, 600);
      setTimeout(killGTBar, 1200);
      return;
    }
    if (attempts > 0) setTimeout(() => tryApply(attempts - 1), 150);
  };
  tryApply(30);
}

/* ── 6. Restore English — the ONLY reliable method is clear cookie + reload ── */
function restoreEnglish() {
  /* Save 'en' so after reload we stay in English */
  localStorage.setItem(LANG_KEY, 'en');

  /* Clear all GT cookies so it doesn't re-translate on reload */
  clearGTCookies();

  /* Reload the page — GT respects the cleared cookie and shows English */
  window.location.reload();
}

/* ── 7. Public: called by dropdown buttons ── */
window.setLang = function (code) {
  const sw = document.getElementById('langSwitcher');
  if (sw) sw.classList.remove('open');

  if (code === 'en') {
    /* Only reload if page is currently translated */
    const current = localStorage.getItem(LANG_KEY) || 'en';
    if (current !== 'en') {
      restoreEnglish();
    }
    /* Already English — just update UI */
    localStorage.setItem(LANG_KEY, 'en');
    updateSwitcherUI('en');
    return;
  }

  localStorage.setItem(LANG_KEY, code);
  updateSwitcherUI(code);
  applyGTLang(code);
};

/* ── 8. GT widget init callback ── */
window.googleTranslateElementInit = function () {
  const el = document.getElementById('google_translate_element');
  if (!el || el.dataset.gtInit) return;
  el.dataset.gtInit = '1';

  new google.translate.TranslateElement({
    pageLanguage:      'en',
    includedLanguages: 'hi,mr,ta,te,gu,bn',
    autoDisplay:       false,
  }, 'google_translate_element');

  setTimeout(killGTBar, 100);
  setTimeout(killGTBar, 500);
  setTimeout(killGTBar, 1000);

  /* Apply saved language after widget is ready */
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && saved !== 'en') {
    setTimeout(() => applyGTLang(saved), 600);
  }
};

/* ── 9. Update dropdown active state ── */
function updateSwitcherUI(code) {
  document.querySelectorAll('#langSwitcher .lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === code);
  });
}

/* ── 10. Build the globe dropdown ── */
function buildSwitcher() {
  const container = document.querySelector('.nav-container');
  if (!container || document.getElementById('langSwitcher')) return;

  const wrapper = document.createElement('div');
  wrapper.id        = 'langSwitcher';
  wrapper.className = 'lang-switcher';

  wrapper.innerHTML = `
    <button class="lang-btn" id="langBtn"
            aria-haspopup="true" aria-expanded="false"
            aria-label="Change language">
      <i class="fas fa-earth-asia"></i>
    </button>
    <div class="lang-dropdown" id="langDropdown" role="menu">
      <div class="lang-dropdown-header">Select Language / भाषा चुनें</div>
      ${LANGUAGES.map(l => `
        <button class="lang-option" data-lang="${l.code}"
                role="menuitem" onclick="setLang('${l.code}')">
          <span class="lang-flag">${l.flag}</span>
          <span class="lang-native">${l.native}</span>
          <span class="lang-english">${l.label}</span>
        </button>`).join('')}
    </div>`;

  container.insertBefore(wrapper, container.firstChild);

  const btn = document.getElementById('langBtn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = wrapper.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    /* Close hamburger menu if open */
    if (open) {
      const hb = document.getElementById('hamburger');
      const nl = document.getElementById('navLinks');
      if (hb) { hb.classList.remove('open'); }
      if (nl) { nl.classList.remove('open'); }
    }
  });
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── 11. Init ── */
injectHideStyles();

document.addEventListener('DOMContentLoaded', () => {
  buildSwitcher();
  watchBodyTop();
  const lang = localStorage.getItem(LANG_KEY) || 'en';
  updateSwitcherUI(lang);
});

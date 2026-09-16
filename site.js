(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const languageButton = document.querySelector('[data-language-toggle]');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('#site-nav');
  const header = document.querySelector('.site-header');
  const language = localStorage.getItem('veyro-language') || 'hu';
  const theme = localStorage.getItem('veyro-theme') || 'dark';

  const formatHuf = value => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`;
  const updateCalculator = () => {
    const hours = Number(document.querySelector('#hours')?.value || 8);
    const rate = Number(document.querySelector('#rate')?.value || 8000);
    const hoursOutput = document.querySelector('#hoursOut');
    const rateOutput = document.querySelector('#rateOut');
    const result = document.querySelector('#monthlyValue');
    if (hoursOutput) hoursOutput.textContent = root.lang === 'en' ? `${hours} hrs` : `${hours} óra`;
    if (rateOutput) rateOutput.textContent = formatHuf(rate);
    if (result) result.textContent = formatHuf(hours * rate * 4);
  };

  const setLanguage = value => {
    const lang = value === 'en' ? 'en' : 'hu';
    root.lang = lang;
    localStorage.setItem('veyro-language', lang);
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      element.textContent = element.dataset[lang];
    });
    if (languageButton) {
      languageButton.textContent = lang === 'hu' ? 'EN' : 'HU';
      languageButton.setAttribute('aria-label', lang === 'hu' ? 'Switch to English' : 'Váltás magyarra');
    }
    document.title = lang === 'hu' ? 'VEYRO | Weboldalak. Rendszerek. Növekedés.' : 'VEYRO | Websites. Systems. Growth.';
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'hu' ? 'hu_HU' : 'en_US');
    updateCalculator();
  };

  const setTheme = value => {
    const next = value === 'light' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('veyro-theme', next);
    if (themeButton) {
      themeButton.textContent = next === 'dark' ? '☼' : '☾';
      themeButton.setAttribute('aria-label', next === 'dark' ? 'Világos téma' : 'Sötét téma');
      themeButton.setAttribute('aria-pressed', String(next === 'light'));
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#050807' : '#f2f6f2');
  };

  setLanguage(language);
  setTheme(theme);
  document.querySelectorAll('#hours, #rate').forEach(input => input.addEventListener('input', updateCalculator));
  languageButton?.addEventListener('click', () => setLanguage(root.lang === 'hu' ? 'en' : 'hu'));
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  menuButton?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(Boolean(open)));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));
  document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - doc.clientHeight);
      progress.style.width = `${Math.min(100, (doc.scrollTop / scrollable) * 100)}%`;
      header?.classList.toggle('is-scrolled', doc.scrollTop > 18);
      if (!reduceMotion && doc.scrollTop < 850) {
        const stage = document.querySelector('.hero-stage');
        const copy = document.querySelector('.hero-copy');
        const y = Math.min(doc.scrollTop, 600);
        if (stage) stage.style.translate = `0 ${(-y * .025).toFixed(1)}px`;
        if (copy) copy.style.translate = `0 ${(y * .012).toFixed(1)}px`;
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (finePointer && !reduceMotion) {
    const targets = document.querySelectorAll('.service,.price-card,.calculator,.lead-form,.stage-window');
    targets.forEach(target => {
      target.classList.add('tilt-target');
      target.addEventListener('pointermove', event => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        target.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        target.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        if (target.classList.contains('stage-window')) return;
        const rx = ((.5 - y) * 3.2).toFixed(2);
        const ry = ((x - .5) * 3.2).toFixed(2);
        target.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
      target.addEventListener('pointerleave', () => {
        target.style.removeProperty('--mx');
        target.style.removeProperty('--my');
        target.style.transform = '';
      });
    });

    const stage = document.querySelector('.stage-window');
    stage?.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      stage.style.animation = 'none';
      stage.style.transform = `perspective(1300px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 8 - 5).toFixed(2)}deg) translateY(-4px)`;
    });
    stage?.addEventListener('pointerleave', () => {
      stage.style.transform = '';
      stage.style.animation = '';
    });
  }

  document.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('details[open]').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();

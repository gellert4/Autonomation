(() => {
  'use strict';

  const root = document.documentElement;
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const $ = selector => document.querySelector(selector);
  const safeGet = (key, fallback) => {
    try { return window.localStorage.getItem(key) || fallback; }
    catch { return fallback; }
  };
  const safeSet = (key, value) => {
    try { window.localStorage.setItem(key, value); } catch {}
  };
  const revealEverything = () => $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));

  try {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const finePointer = window.matchMedia?.('(hover:hover) and (pointer:fine)').matches ?? false;
    const languageButton = $('[data-language-toggle]');
    const themeButton = $('[data-theme-toggle]');
    const menuButton = $('[data-menu-toggle]');
    const nav = $('#site-nav');
    const header = $('.site-header');

    const formatHuf = value => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`;
    const updateCalculator = () => {
      const hours = Number($('#hours')?.value || 8);
      const rate = Number($('#rate')?.value || 8000);
      const hoursOutput = $('#hoursOut');
      const rateOutput = $('#rateOut');
      const result = $('#monthlyValue');
      if (hoursOutput) hoursOutput.textContent = root.lang === 'en' ? `${hours} hrs` : `${hours} óra`;
      if (rateOutput) rateOutput.textContent = formatHuf(rate);
      if (result) result.textContent = formatHuf(hours * rate * 4);
    };

    const setLanguage = value => {
      const lang = value === 'en' ? 'en' : 'hu';
      root.lang = lang;
      safeSet('veyro-language', lang);
      $$('[data-hu][data-en]').forEach(element => {
        const next = element.dataset[lang];
        if (typeof next === 'string') element.textContent = next;
      });
      if (languageButton) {
        languageButton.textContent = lang === 'hu' ? 'EN' : 'HU';
        languageButton.setAttribute('aria-label', lang === 'hu' ? 'Switch to English' : 'Váltás magyarra');
      }
      document.title = lang === 'hu'
        ? 'VEYRO | Weboldalak. Rendszerek. Növekedés.'
        : 'VEYRO | Websites. Systems. Growth.';
      $('meta[property="og:locale"]')?.setAttribute('content', lang === 'hu' ? 'hu_HU' : 'en_US');
      updateCalculator();
    };

    const setTheme = value => {
      const next = value === 'light' ? 'light' : 'dark';
      root.dataset.theme = next;
      safeSet('veyro-theme', next);
      if (themeButton) {
        themeButton.textContent = next === 'dark' ? '☼' : '☾';
        themeButton.setAttribute('aria-label', next === 'dark' ? 'Világos téma' : 'Sötét téma');
        themeButton.setAttribute('aria-pressed', String(next === 'light'));
      }
      $('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#050807' : '#f2f6f2');
    };

    setLanguage(safeGet('veyro-language', 'hu'));
    setTheme(safeGet('veyro-theme', 'dark'));

    $$('#hours, #rate').forEach(input => input.addEventListener('input', updateCalculator));
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

    $('#year')?.replaceChildren(String(new Date().getFullYear()));

    // Content is visible by default. Reveal animation is progressive enhancement only.
    revealEverything();
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), { threshold: 0.01, rootMargin: '0px 0px -2% 0px' });
      $$('[data-reveal]').forEach(element => observer.observe(element));
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
          const stage = $('.hero-stage');
          const copy = $('.hero-copy');
          const y = Math.min(doc.scrollTop, 600);
          if (stage) stage.style.translate = `0 ${(-y * .025).toFixed(1)}px`;
          if (copy) copy.style.translate = `0 ${(y * .012).toFixed(1)}px`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (finePointer && !reduceMotion) {
      $$('.service,.price-card,.calculator,.lead-form,.stage-window').forEach(target => {
        target.classList.add('tilt-target');
        target.addEventListener('pointermove', event => {
          const rect = target.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
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

      const stage = $('.stage-window');
      stage?.addEventListener('pointermove', event => {
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
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

    $$('details').forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (!detail.open) return;
        $$('details[open]').forEach(other => {
          if (other !== detail) other.open = false;
        });
      });
    });
  } catch (error) {
    revealEverything();
    document.documentElement.classList.add('runtime-fallback');
    console.error('VEYRO runtime fallback:', error);
  }
})();

(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const languageButton = $('[data-language-toggle]');
  const themeButton = $('[data-theme-toggle]');
  const menuButton = $('[data-menu-toggle]');
  const nav = $('#site-nav');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatHuf = value => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`;

  const setLanguage = value => {
    root.lang = value;
    localStorage.setItem('veyro-language', value);
    $$('[data-hu][data-en]').forEach(el => { el.textContent = el.dataset[value]; });
    if (languageButton) languageButton.textContent = value === 'hu' ? 'EN' : 'HU';
    document.title = value === 'hu' ? 'VEYRO | Weboldalak. Rendszerek. Növekedés.' : 'VEYRO | Websites. Systems. Growth.';
    updateCalculator();
  };
  const setTheme = value => {
    root.dataset.theme = value;
    localStorage.setItem('veyro-theme', value);
    if (themeButton) {
      themeButton.textContent = value === 'dark' ? '☼' : '☾';
      themeButton.setAttribute('aria-label', value === 'dark' ? 'Világos téma' : 'Sötét téma');
    }
  };
  setLanguage(localStorage.getItem('veyro-language') || 'hu');
  setTheme(localStorage.getItem('veyro-theme') || 'dark');

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

  const updateCalculator = () => {
    const hours = Number($('#hours')?.value || 8);
    const rate = Number($('#rate')?.value || 8000);
    if ($('#hoursOut')) $('#hoursOut').textContent = root.lang === 'en' ? `${hours} hrs` : `${hours} óra`;
    if ($('#rateOut')) $('#rateOut').textContent = formatHuf(rate);
    if ($('#monthlyValue')) $('#monthlyValue').textContent = formatHuf(hours * rate * 4);
  };
  $$('#hours, #rate').forEach(input => input.addEventListener('input', updateCalculator));
  updateCalculator();

  $('#year')?.replaceChildren(String(new Date().getFullYear()));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    $$('[data-reveal]').forEach(el => observer.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  const progress = $('.scroll-progress span');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('--rx', `${-y * 5}deg`);
        card.style.setProperty('--ry', `${x * 7}deg`);
        card.style.setProperty('--mx', `${(x + .5) * 100}%`);
        card.style.setProperty('--my', `${(y + .5) * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }

  const params = new URLSearchParams(location.search);
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const currentTouch = { landing: location.href, referrer: document.referrer || '', ts: new Date().toISOString() };
  utmKeys.forEach(k => currentTouch[k] = params.get(k) || '');
  if (!localStorage.getItem('veyro-first-touch')) localStorage.setItem('veyro-first-touch', JSON.stringify(currentTouch));
  localStorage.setItem('veyro-last-touch', JSON.stringify(currentTouch));
  const firstTouch = (() => { try { return JSON.parse(localStorage.getItem('veyro-first-touch') || '{}'); } catch { return {}; } })();
  const map = { utm_source:'#utmSource',utm_medium:'#utmMedium',utm_campaign:'#utmCampaign',utm_content:'#utmContent',utm_term:'#utmTerm' };
  Object.entries(map).forEach(([k,s]) => { if ($(s)) $(s).value = params.get(k) || currentTouch[k] || ''; });
  if ($('#firstTouch')) $('#firstTouch').value = JSON.stringify(firstTouch);
  if ($('#landingPage')) $('#landingPage').value = location.href;
  if ($('#referrerField')) $('#referrerField').value = document.referrer || '';
  if ($('#leadId')) $('#leadId').value = `VEY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

  const serviceScore = { website:10, web_system:22, automation:25, custom:30 };
  const budgetScore = { under150:0, '150_250':10, '250_500':22, '500plus':30, unknown:5 };
  const timelineScore = { asap:25, month:20, quarter:10, later:5 };
  const calculateLeadScore = () => {
    let score = (serviceScore[$('#serviceField')?.value] || 0) + (budgetScore[$('#budgetField')?.value] || 0) + (timelineScore[$('#timelineField')?.value] || 0);
    const problem = $('#problemField')?.value.trim() || '';
    if (problem.length >= 80) score += 10;
    if ($('[name="website"]')?.value.trim()) score += 5;
    score = Math.min(score, 100);
    const grade = score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';
    if ($('#leadScore')) $('#leadScore').value = String(score);
    if ($('#leadGrade')) $('#leadGrade').value = grade;
    if ($('#scorePreview')) $('#scorePreview').textContent = score ? `${grade} / ${score}` : '—';
    return { score, grade };
  };
  ['#serviceField','#budgetField','#timelineField','#problemField','[name="website"]'].forEach(sel => $(sel)?.addEventListener('input', calculateLeadScore));
  calculateLeadScore();

  $$('.plan-link').forEach(link => link.addEventListener('click', () => {
    const plan = link.dataset.plan;
    const service = $('#serviceField');
    if (service) service.value = plan === 'Start' ? 'website' : plan === 'Growth' ? 'web_system' : 'custom';
    calculateLeadScore();
  }));

  const consentBanner = $('#consentBanner');
  const config = window.VEYRO_CONFIG || {};
  const analyticsEnabled = Boolean(config.ga4MeasurementId);
  const consent = localStorage.getItem('veyro-analytics-consent');
  const loadAnalytics = () => {
    if (!analyticsEnabled || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    const script = document.createElement('script');
    script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', config.ga4MeasurementId, { anonymize_ip: true });
  };
  if (analyticsEnabled && !consent && consentBanner) consentBanner.hidden = false;
  if (analyticsEnabled && consent === 'analytics') loadAnalytics();
  $$('[data-consent]').forEach(btn => btn.addEventListener('click', () => {
    const value = btn.dataset.consent;
    localStorage.setItem('veyro-analytics-consent', value);
    if (consentBanner) consentBanner.hidden = true;
    if (value === 'analytics') loadAnalytics();
  }));
  const track = (name, eventParams = {}) => { if (typeof window.gtag === 'function') gtag('event', name, eventParams); };
  $$('.track-cta').forEach(el => el.addEventListener('click', () => track('cta_click', { placement: el.dataset.event || 'unknown' })));
  $$('.track-demo').forEach(el => el.addEventListener('click', () => track('demo_view', { demo: el.dataset.demo })));

  const form = $('#leadForm');
  let formStarted = false;
  form?.addEventListener('input', () => { if (!formStarted) { formStarted = true; track('form_start'); } });
  form?.addEventListener('submit', () => {
    const { score, grade } = calculateLeadScore();
    track('generate_lead', { lead_score: score, lead_grade: grade });
    const submit = form.querySelector('button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = root.lang === 'en' ? 'Sending…' : 'Küldés…'; }
  });
})();

(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('[data-language-toggle]');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('#site-nav');
  const language = localStorage.getItem('veyro-language') || 'hu';
  const theme = localStorage.getItem('veyro-theme') || 'dark';

  const formatHuf = value => `${new Intl.NumberFormat('hu-HU').format(value)} Ft`;
  const setLanguage = value => {
    root.lang = value;
    localStorage.setItem('veyro-language', value);
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      element.textContent = element.dataset[value];
    });
    if (languageButton) languageButton.textContent = value === 'hu' ? 'EN' : 'HU';
    document.title = value === 'hu' ? 'VEYRO | Weboldalak. Rendszerek. Növekedés.' : 'VEYRO | Websites. Systems. Growth.';
    updateCalculator();
  };
  const setTheme = value => {
    root.dataset.theme = value;
    localStorage.setItem('veyro-theme', value);
    if (themeButton) themeButton.setAttribute('aria-label', value === 'dark' ? 'Világos téma' : 'Sötét téma');
  };
  const updateCalculator = () => {
    const hours = Number(document.querySelector('#hours')?.value || 8);
    const rate = Number(document.querySelector('#rate')?.value || 8000);
    const hoursOutput = document.querySelector('#hoursOut');
    const rateOutput = document.querySelector('#rateOut');
    const result = document.querySelector('#monthlyValue');
    if (hoursOutput) hoursOutput.textContent = `${hours} óra`;
    if (rateOutput) rateOutput.textContent = formatHuf(rate);
    if (result) result.textContent = formatHuf(hours * rate * 4);
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

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }), { threshold: 0.14 });
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
})();

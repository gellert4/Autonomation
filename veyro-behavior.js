const veyroTitle = () => {
  document.title = document.documentElement.lang === 'en'
    ? 'VEYRO | Websites. Systems. Growth.'
    : 'VEYRO | Weboldalak. Rendszerek. Növekedés.';
};
veyroTitle();
document.getElementById('langToggle')?.addEventListener('click', () => setTimeout(veyroTitle, 0));

(() => {
  const config = window.VEYRO_CONFIG || {};
  const consent = localStorage.getItem('veyro-analytics-consent');
  if (!config.ga4MeasurementId || consent !== 'analytics') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`;
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', config.ga4MeasurementId, { anonymize_ip: true });
  gtag('event', 'lead_complete', { page_location: location.href });
})();

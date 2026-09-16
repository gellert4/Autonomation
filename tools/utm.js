(() => {
  const $ = id => document.getElementById(id);
  $('build')?.addEventListener('click', async () => {
    try {
      const url = new URL($('base').value.trim());
      const values = {
        utm_source: $('source').value.trim(),
        utm_medium: $('medium').value.trim(),
        utm_campaign: $('campaign').value.trim(),
        utm_content: $('content').value.trim()
      };
      Object.entries(values).forEach(([k,v]) => v ? url.searchParams.set(k,v) : url.searchParams.delete(k));
      $('result').value = url.toString();
      try { await navigator.clipboard.writeText(url.toString()); $('status').textContent = 'Kész, a linket a vágólapra is másoltam.'; }
      catch { $('status').textContent = 'Kész. Másold ki a fenti linket.'; }
    } catch {
      $('status').textContent = 'Adj meg érvényes alap URL-t.';
    }
  });
})();

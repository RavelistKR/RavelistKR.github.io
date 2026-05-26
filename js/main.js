(function () {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  let mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  root.setAttribute('data-theme', mode);

  function renderIcon(nextMode) {
    if (!button) return;

    button.innerHTML = nextMode === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v2.2M12 18.8V21M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M3 12h2.2M18.8 12H21M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56"></path><circle cx="12" cy="12" r="4.2"></circle></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7.2 7.2 0 0 0 21 12.79z"></path></svg>';

    button.setAttribute('aria-label', nextMode === 'dark' ? '라이트 모드 전환' : '다크 모드 전환');
  }

  renderIcon(mode);

  if (button) {
    button.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      renderIcon(mode);
    });
  }
})();

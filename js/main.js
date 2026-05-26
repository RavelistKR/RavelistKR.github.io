(function () {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = navLinks
    .map((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  let mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  root.setAttribute('data-theme', mode);

  function renderIcon(nextMode) {
    if (!button) return;

    button.innerHTML = nextMode === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v2.2M12 18.8V21M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M3 12h2.2M18.8 12H21M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56"></path><circle cx="12" cy="12" r="4.2"></circle></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7.2 7.2 0 0 0 21 12.79z"></path></svg>';

    button.setAttribute('aria-label', nextMode === 'dark' ? '라이트 모드 전환' : '다크 모드 전환');
  }

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function updateActiveNav() {
    if (!sections.length) return;

    const offset = (header ? header.offsetHeight : 72) + 80;
    let current = sections[0];

    sections.forEach((item) => {
      if (window.scrollY >= item.target.offsetTop - offset) {
        current = item;
      }
    });

    sections.forEach((item) => {
      item.link.classList.toggle('is-active', item === current);
      if (item === current) {
        item.link.setAttribute('aria-current', 'page');
      } else {
        item.link.removeAttribute('aria-current');
      }
    });
  }

  function onScroll() {
    updateHeaderState();
    updateActiveNav();
  }

  renderIcon(mode);
  updateHeaderState();
  updateActiveNav();

  if (button) {
    button.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      renderIcon(mode);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveNav);

  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      requestAnimationFrame(updateActiveNav);
    });
  });
})();

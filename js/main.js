(function () {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav-links');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      return target ? { link, target, href } : null;
    })
    .filter(Boolean);

  const savedTheme = localStorage.getItem('theme');
  let mode = savedTheme ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  let activeHref = '';
  let headerOffset = (header ? header.offsetHeight : 72) + 80;

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
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function scrollActiveLinkIntoView(link) {
    if (!nav || !link || window.innerWidth > 980) return;

    link.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  function setActiveNavLink(current) {
    if (!current) return;

    sections.forEach((item) => {
      const isCurrent = item === current;
      item.link.classList.toggle('is-active', isCurrent);

      if (isCurrent) {
        item.link.setAttribute('aria-current', 'page');
      } else {
        item.link.removeAttribute('aria-current');
      }
    });

    if (current.href !== activeHref) {
      activeHref = current.href;
      scrollActiveLinkIntoView(current.link);
    }
  }

  let observer = null;
  function initScrollSpy() {
    if (!sections.length) return;
    if (observer) observer.disconnect();

    // 헤더 영역 아래부터 화면의 50% 지점 사이에 섹션이 들어오는지 관찰
    const rootMargin = `-${headerOffset}px 0px -50% 0px`;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentItem = sections.find((item) => item.target === entry.target);
            setActiveNavLink(currentItem);
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    sections.forEach((item) => observer.observe(item.target));
  }

  let isScrolling = false;
  function onScroll() {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateHeaderState();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }

  renderIcon(mode);
  updateHeaderState();
  initScrollSpy();

  if (button) {
    button.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      renderIcon(mode);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    headerOffset = (header ? header.offsetHeight : 72) + 80;
    initScrollSpy();
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      const currentItem = sections.find((item) => item.link === link);
      if (currentItem) {
        setActiveNavLink(currentItem);
      }
    });
  });
})();

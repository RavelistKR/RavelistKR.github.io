(function () {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  const btnTop = document.getElementById('btn-top');
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
        if (btnTop) {
          btnTop.classList.toggle('is-visible', window.scrollY > 300);
        }
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

  function updateMenuIcon(isOpen) {
    if (!menuToggle) return;
    menuToggle.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      updateMenuIcon(isOpen);
    });
  }

  if (btnTop) {
    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      // 모바일 메뉴가 열려있다면 링크 클릭 시 메뉴 닫기
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          updateMenuIcon(false);
        }
      }

      const currentItem = sections.find((item) => item.link === link);
      if (currentItem) {
        setActiveNavLink(currentItem);
      }
    });
  });

  // ==========================================
  // 추천 매물 더미 데이터 및 카드 렌더링
  // ==========================================
  const dummyListings = [
    {
      id: 1,
      type: '매매',
      price: '5억 5,000',
      title: '의정부역 도보 5분 신축 3룸',
      details: '방 3 · 화장실 2 · 남향 · 고층',
      tags: ['역세권', '신축', '채광우수'],
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      type: '전세',
      price: '3억 2,000',
      title: '양주 옥정신도시 중심상가 인근',
      details: '방 3 · 화장실 2 · 판상형 구조',
      tags: ['인프라', '공원인접', '학세권'],
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      type: '월세',
      price: '3,000 / 120',
      title: '의정부 민락동 깔끔한 투룸',
      details: '방 2 · 화장실 1 · 풀옵션',
      tags: ['풀옵션', '즉시입주', '주차편리'],
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80'
    }
  ];

  // 성능 테스트를 위해 기존 데이터를 복제하여 12개의 더미 데이터 생성
  const expandedListings = Array.from({ length: 12 }, (_, i) => {
    const base = dummyListings[i % dummyListings.length];
    return { ...base, id: i + 1 };
  });

  let currentFilter = 'all';
  let currentPage = 1;
  const ITEMS_PER_PAGE = 4; // 한 번에 불러올 매물 수

  function renderListings(filterType = 'all', isLoadMore = false) {
    const container = document.querySelector('#listings .listings-grid');
    if (!container) return;

    // 새 필터 적용 시 페이징 초기화
    if (!isLoadMore) {
      currentFilter = filterType;
      currentPage = 1;
      container.innerHTML = ''; // 초기화
    }

    const filteredListings = currentFilter === 'all' 
      ? expandedListings 
      : expandedListings.filter(item => item.type === currentFilter);

    if (filteredListings.length === 0 && !isLoadMore) {
      container.innerHTML = `
        <div class="empty-state">
          <p>해당 조건의 매물이 없습니다.</p>
        </div>
      `;
      return;
    }

    // 더보기 버튼 영역이 있다면 렌더링 전 잠시 제거
    const existingLoadMore = container.querySelector('.load-more-wrapper');
    if (existingLoadMore) existingLoadMore.remove();

    // 현재 페이지에 해당하는 데이터만 잘라내기
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const listingsToRender = filteredListings.slice(startIndex, endIndex);

    const html = listingsToRender.map(item => `
      <div class="listing-card">
        <div class="card-image" style="background-image: url('${item.imageUrl}')">
          <span class="card-badge">${item.type}</span>
        </div>
        <div class="card-content">
          <h3 class="card-price">${item.price}</h3>
          <p class="card-title">${item.title}</p>
          <p class="card-details">${item.details}</p>
          <div class="card-tags">
            ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // 더보기인지, 처음 렌더링인지에 따라 HTML 삽입 방식 변경
    if (isLoadMore) {
      container.insertAdjacentHTML('beforeend', html);
    } else {
      container.innerHTML = html;
    }

    // 불러올 데이터가 더 남았다면 더보기 버튼을 맨 끝에 추가
    if (endIndex < filteredListings.length) {
      container.insertAdjacentHTML('beforeend', `
        <div class="load-more-wrapper">
          <button class="btn btn-secondary" id="load-more-btn">더보기</button>
        </div>
      `);
      const loadMoreBtn = container.querySelector('#load-more-btn');
      loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderListings(currentFilter, true); // 다음 페이지 렌더링
      });
    }
  }

  // 초기 렌더링 실행
  renderListings();

  // 탭 필터 이벤트 리스너 추가
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // 모든 탭 버튼에서 활성화 상태 제거 후 클릭된 버튼만 활성화
      tabButtons.forEach(btn => btn.classList.remove('is-active'));
      e.target.classList.add('is-active');

      // 선택된 필터값으로 데이터 다시 렌더링
      const filter = e.target.getAttribute('data-filter');
      renderListings(filter);
    });
  });

  // ==========================================
  // 실거래가·시세 더미 데이터 및 카드 렌더링
  // ==========================================
  const dummyPrices = [
    {
      id: '01',
      title: '의정부역 센트럴자이 (84㎡)',
      price: '7억 2,000만원',
      date: '24.05 최근 거래',
      desc: '현재 호가는 7억 3,000 ~ 7억 5,000 선에 형성되어 있으며, 역세권 신축 수요로 꾸준한 거래가 이어지고 있습니다.'
    },
    {
      id: '02',
      title: '탑석센트럴자이 (84㎡)',
      price: '5억 8,000만원',
      date: '24.04 최근 거래',
      desc: '고산지구 대장 단지로 실거주 만족도가 높으며, 전세가는 3억 5,000만원 전후로 안정적인 흐름을 보입니다.'
    },
    {
      id: '03',
      title: '양주옥정 대방노블랜드 (84㎡)',
      price: '4억 5,000만원',
      date: '24.05 최근 거래',
      desc: '신도시 인프라가 갖춰지며 문의가 늘고 있습니다. 급매물이 소진되며 호가가 점진적으로 오르는 추세입니다.'
    }
  ];

  function renderPrices() {
    const container = document.querySelector('#price .focus-grid');
    if (!container) return;

    container.innerHTML = dummyPrices.map(item => `
      <article class="section-card">
        <span class="number">${item.id}</span>
        <h3 style="margin-bottom: 8px;">${item.title}</h3>
        <p style="margin-bottom: 12px;">
          <strong style="color: var(--color-primary); font-size: 1.1rem;">${item.price}</strong> 
          <span style="font-size: var(--text-xs); color: var(--color-text-faint);">(${item.date})</span>
        </p>
        <p>${item.desc}</p>
      </article>
    `).join('');
  }

  renderPrices();

  // ==========================================
  // 상담 문의 폼 (Formspree) 비동기 전송 처리
  // ==========================================
  const consultForm = document.querySelector('.consult-form');
  const successMessage = document.getElementById('form-success-message');
  const errorMessage = document.getElementById('form-error-message');

  if (consultForm) {
    consultForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // 이전 메시지 초기화
      if (successMessage) successMessage.hidden = true;
      if (errorMessage) errorMessage.hidden = true;

      const formData = new FormData(consultForm);
      const actionUrl = consultForm.getAttribute('action');
      const submitBtn = consultForm.querySelector('button[type="submit"]');

      // 중복 전송 방지를 위한 버튼 비활성화
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '전송 중...';
      }

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          if (successMessage) successMessage.hidden = false;
          consultForm.reset(); // 성공 시 폼 입력값 초기화
        } else {
          if (errorMessage) errorMessage.hidden = false;
        }
      } catch (error) {
        if (errorMessage) errorMessage.hidden = false;
      } finally {
        // 처리 완료 후 버튼 원상 복구
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '문의 보내기';
        }
      }
    });
  }
})();

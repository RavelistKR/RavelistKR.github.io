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

  // 실제 매물 데이터를 담을 전역 배열
  let realListings = [];

  let currentFilter = 'all';
  let currentPage = 1;
  const ITEMS_PER_PAGE = 4; // 한 번에 불러올 매물 수

  // 외부 JSON 데이터를 비동기로 불러오는 함수
  async function loadListingsData() {
    try {
      // [!] Step 2에서 복사한 본인의 스프레드시트 ID를 아래에 붙여넣으세요.
      const SHEET_ID = '여기에_복사한_ID를_넣어주세요'; 
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;

      const response = await fetch(url);
      const text = await response.text();

      // 구글 API가 반환하는 텍스트에서 순수 JSON 데이터만 추출
      const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/)[1];
      const data = JSON.parse(jsonString);

      // 스프레드시트의 각 행(Row) 데이터를 웹사이트에 맞는 객체로 변환
      realListings = data.table.rows.map(row => {
        const cols = row.c;
        return {
          id: cols[0] ? cols[0].v : '',
          type: cols[1] ? cols[1].v : '',
          price: cols[2] ? cols[2].v : '',
          title: cols[3] ? cols[3].v : '',
          details: cols[4] ? cols[4].v : '',
          tags: cols[5] && cols[5].v ? cols[5].v.split(',').map(tag => tag.trim()) : [],
          imageUrl: cols[6] ? cols[6].v : ''
        };
      }).filter(item => item.id); // ID가 없는 빈 행은 제외

      if (realListings.length === 0) {
        realListings = Array.from({ length: 12 }, (_, i) => ({ ...dummyListings[i % dummyListings.length], id: i + 1 }));
      }
      
      renderListings(); // 데이터 로드 후 화면 렌더링
    } catch (error) {
      console.error('매물 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
  }

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
      ? realListings 
      : realListings.filter(item => item.type === currentFilter);

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
      <div class="listing-card" data-id="${item.id}">
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

  // 초기 데이터 로드 및 렌더링 실행
  loadListingsData();

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

  // 실제 실거래가 데이터를 담을 전역 배열
  let realPrices = [];

  // 외부 JSON(구글 시트) 데이터를 비동기로 불러오는 함수
  async function loadPricesData() {
    const container = document.querySelector('#price .focus-grid');
    if (container) {
      container.innerHTML = Array(3).fill(`
        <article class="section-card">
          <div class="skeleton" style="width: 40px; height: 28px; border-radius: 999px; margin-bottom: 14px;"></div>
          <div class="skeleton" style="width: 70%; height: 24px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="width: 50%; height: 20px; margin-bottom: 16px;"></div>
          <div class="skeleton" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
          <div class="skeleton" style="width: 80%; height: 16px;"></div>
        </article>
      `).join('');
    }

    try {
      // [!] 실거래가용으로 새로 만든 구글 스프레드시트의 ID를 붙여넣으세요.
      const PRICE_SHEET_ID = '여기에_실거래가_스프레드시트_ID를_넣어주세요'; 
      const url = `https://docs.google.com/spreadsheets/d/${PRICE_SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;

      const response = await fetch(url);
      const text = await response.text();

      const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/)[1];
      const data = JSON.parse(jsonString);

      // 스프레드시트 데이터를 자바스크립트 객체로 변환
      realPrices = data.table.rows.map(row => {
        const cols = row.c;
        return {
          id: cols[0] ? cols[0].v : '',
          title: cols[1] ? cols[1].v : '',
          price: cols[2] ? cols[2].v : '',
          date: cols[3] ? cols[3].v : '',
          desc: cols[4] ? cols[4].v : ''
        };
      }).filter(item => item.id);

      if (realPrices.length === 0) {
        realPrices = [...dummyPrices];
      }
      
      renderPrices(); // 데이터 로딩 완료 후 화면 렌더링
    } catch (error) {
      console.error('실거래가 데이터를 불러오는 중 오류가 발생했습니다:', error);
      realPrices = [...dummyPrices]; // 에러 발생 시 임시 데이터 렌더링
      renderPrices();
    }
  }

  function renderPrices() {
    const container = document.querySelector('#price .focus-grid');
    if (!container) return;

    container.innerHTML = realPrices.map(item => `
      <article class="section-card" data-id="${item.id}">
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

  // 초기 렌더링 함수 교체
  loadPricesData();

  // ==========================================
  // 상세 정보 팝업 (Modal) 처리 로직
  // ==========================================
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtns = document.querySelectorAll('[data-modal-close]');
  let previousActiveElement = null; // 포커스 복구를 위한 변수

  function openModal(contentHtml) {
    if (!modal || !modalBody) return;
    
    previousActiveElement = document.activeElement; // 모달 열기 전 활성 요소 기억

    modalBody.innerHTML = contentHtml;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지

    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }, 100);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // 배경 스크롤 복구

    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // 모달 내부에서 Tab 키를 누를 때 밖으로 나가지 않도록 가두기 (Focus Trap)
  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  if (modalBody) {
    modalBody.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const title = link.getAttribute('data-title');
        const topicInput = document.getElementById('topic');
        if (title && topicInput) {
          topicInput.value = title; // 문의 폼의 상담 주제 칸에 자동으로 값 입력
        }
        closeModal(); // 모달 내 상담 버튼 클릭 시 자동 닫기
      }
    });
  }

  // 추천매물 카드 클릭 이벤트
  const listingsContainer = document.querySelector('#listings .listings-grid');
  if (listingsContainer) {
    listingsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.listing-card');
      if (!card) return;
      const id = Number(card.getAttribute('data-id'));
      const item = realListings.find(l => l.id === id);
      if (item) {
        openModal(`
          <img class="modal-image" src="${item.imageUrl}" alt="${item.title}">
          <h2 class="modal-title">${item.title}</h2>
          <div class="modal-price">${item.type} ${item.price}</div>
          <p class="modal-desc">${item.details}</p>
          <div class="modal-meta">
            ${item.tags.map(tag => `<span>#${tag}</span>`).join('')}
          </div>
          <a href="#contact" class="btn btn-primary" data-title="[매물 문의] ${item.title}" style="width: 100%;">이 매물 상담하기</a>
        `);
      }
    });

    listingsContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.listing-card');
        if (card) { e.preventDefault(); card.click(); }
      }
    });
  }

  // 실거래가 카드 클릭 이벤트
  const priceContainer = document.querySelector('#price .focus-grid');
  if (priceContainer) {
    priceContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.section-card');
      if (!card) return;
      const id = card.getAttribute('data-id');
      // 스프레드시트의 숫자형 id와 HTML의 문자열 id를 안전하게 비교
      const item = realPrices.find(p => String(p.id) === String(id));
      if (item) {
        openModal(`
          <div style="margin-bottom: 24px;">
            <span class="number" style="background: color-mix(in srgb, #b08a2a 16%, var(--color-surface-2)); color: #8a6a16; padding: 8px 12px; border-radius: 999px; font-size: var(--text-xs); font-weight: 700;">${item.id}</span>
          </div>
          <h2 class="modal-title">${item.title}</h2>
          <div class="modal-price">${item.price} <span style="font-size: var(--text-sm); font-weight: normal; color: var(--color-text-faint);">(${item.date})</span></div>
          <p class="modal-desc">${item.desc}</p>
          <a href="#contact" class="btn btn-primary" data-title="[시세 문의] ${item.title}" style="width: 100%;">이 지역 실거래 상담하기</a>
        `);
      }
    });

    priceContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.section-card');
        if (card) { e.preventDefault(); card.click(); }
      }
    });
  }

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
          
          // 5초 뒤에 성공 메시지도 다시 숨기기 (완전한 초기화)
          setTimeout(() => {
            if (successMessage) successMessage.hidden = true;
          }, 5000);
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

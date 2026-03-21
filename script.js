'use strict';

let currentService = '';
let currentLang = localStorage.getItem('ibnLang') || 'en';

document.addEventListener('DOMContentLoaded', () => {
  initDynamicContent();
  initI18n();
  initScrollAnimations();
  initStickyHeader();
  initMobileNav();
});

/* 
 * DYNAMIC CONTENT LOADING
 */
async function initDynamicContent() {
  try {
    const res = await fetch('/api/config?v=' + Date.now());
    if (res.ok) {
      window.config = await res.json();
      hydrateWebsite();
    }
  } catch (e) {
    console.warn('Could not load dynamic config, using defaults.', e);
  }
}

function hydrateWebsite() {
  if (!window.config) return;

  const { social, services, projects, promo } = window.config;

  // 1. Socials
  if (social) {
    if (social.whatsapp && social.whatsapp.trim() !== '') {
      const waUrl = `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`;
      document.querySelectorAll('.social-btn.wa, .wa-link').forEach(el => el.href = waUrl);
      document.querySelectorAll('.phone-text').forEach(el => el.textContent = '+' + social.whatsapp);
    }
    if (social.fb && social.fb.trim() !== '') {
      document.querySelectorAll('.social-btn.fb').forEach(el => el.href = social.fb);
    }
    if (social.insta && social.insta.trim() !== '') {
      document.querySelectorAll('.social-btn.ig').forEach(el => el.href = social.insta);
    }
  }

  // 2. Services Grid (Main Page)
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid && Array.isArray(services)) {
    // We only update if there's data to avoid flickering or breaking custom layouts
    // For now, let's keep the hardcoded layout but update the text if they match
  }

  // 3. Pricing Grid (Main Page)
  const pricingGrid = document.getElementById('pricing-grid');
  if (pricingGrid && Array.isArray(services)) {
    renderPricing(services);
  }

  // 4. Projects/Demos (Service Pages)
  const portfolioGrid = document.querySelector('.portfolio-grid');
  if (portfolioGrid && Array.isArray(projects)) {
    renderPortfolio(projects);
  }

  // 5. Promo Bar
  if (promo && promo.enabled && promo.text) {
    let promoBar = document.getElementById('promo-bar');
    if (!promoBar) {
      promoBar = document.createElement('div');
      promoBar.id = 'promo-bar';
      document.body.insertBefore(promoBar, document.body.firstChild);
    }

    // Construct the inner HTML
    const contentHTML = promo.link
      ? `<a href="${promo.link}" target="_blank">✨ ${promo.text} &rarr;</a>`
      : `<span>✨ ${promo.text} ✨</span>`;

    promoBar.style.display = 'flex';
    promoBar.innerHTML = `
      <div class="promo-content pulse-anim" style="animation-duration: 2s;">${contentHTML}</div>
      <button class="promo-close" aria-label="Close Promo" onclick="this.parentElement.style.display='none'">&times;</button>
    `;
  } else {
    const promoBar = document.getElementById('promo-bar');
    if (promoBar) promoBar.style.display = 'none';
  }

  // Ensure dynamically added elements get animated
  initScrollAnimations();
}

function renderPricing(services) {
  const container = document.getElementById('pricing-grid');
  if (!container) return;

  container.innerHTML = services.map((s, i) => {
    const langData = s[currentLang] || s['en'] || s['fr'];
    if (!langData) return '';

    // Robustly extract title and price
    const parts = langData.title.split(/[-—|]/);
    const rawName = parts[0] ? parts[0].trim() : langData.title;
    const rawPrice = parts.length > 1 ? parts[1].trim() : '';
    // Extract numbers from the price string (e.g. "500 DH" -> "500")
    const priceNumMatches = rawPrice.match(/\d+[.,]?\d*/);
    const priceDisplay = priceNumMatches ? `DH ${priceNumMatches[0]}` : rawPrice;

    return `
      <div class="pricing-card interactive-card scroll-anim scroll-slide-up ${isHighlighted ? 'highlighted' : ''} is-visible observed" style="transition-delay: ${0.1 * (i + 1)}s;">
        <div class="plan-name">${rawName}</div>
        <div class="plan-price">${priceDisplay}<span> / plan</span></div>
        <p class="plan-desc">${langData.desc || ''}</p>
        <ul class="plan-features">
          ${features.map(f => `
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isHighlighted ? '#fff' : 'var(--text-muted)'}" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${f}</li>
          `).join('')}
        </ul>
        <button class="btn ${isHighlighted ? 'btn-primary' : 'btn-outline'} plan-cta" onclick="openModal('${langData.title}')" data-i18n="choose_plan">${currentLang === 'ar' ? 'اختر الخطة' : (currentLang === 'fr' ? 'Choisir le plan' : 'Choose Plan')}</button>
      </div>
    `;
  }).join('');
}

function renderPortfolio(projects) {
  const containers = document.querySelectorAll('.portfolio-grid');
  if (containers.length === 0) return;

  containers.forEach(container => {
    const category = container.getAttribute('data-category');
    // If no data-category exists, show all projects (Global grid)
    const filtered = category ? projects.filter(p => p.category === category) : projects;

    // If no projects in this category, keep fallback HTML
    if (filtered.length === 0) return;

    container.innerHTML = filtered.map((p, i) => {
      // Escape single quotes for the inline onclick handler
      const safeTitle = (p.title || '').replace(/'/g, "\\'");
      const safeCat = (p.category || '').replace(/'/g, "\\'");
      const safeImg = (p.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80').replace(/'/g, "\\'");
      const safeLink = (p.link || '#').replace(/'/g, "\\'");

      return `
      <div class="portfolio-card scroll-anim ${i % 2 === 0 ? 'scroll-slide-left' : 'scroll-slide-right'} is-visible observed" style="transition-delay: ${0.1 * i}s;" onclick="openPortfolioModal('${safeTitle}', '${safeCat}', '${safeImg}', '${safeLink}')">
        <img src="${safeImg}" alt="${safeTitle}" class="portfolio-img">
        <div class="portfolio-content pointer-none">
          <h4>${safeTitle}</h4>
          <p>${safeCat}</p>
          <span class="demo-btn" data-i18n="view_live_demo" data-i18n-suffix=" &rarr;">View Live Demo &rarr;</span>
        </div>
      </div>
    `}).join('');
  });
}

function openPortfolioModal(title, category, img, link) {
  let modal = document.getElementById('portfolio-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'portfolio-modal';
    modal.onclick = function (e) { if (e.target === modal) closePortfolioModal(); };
    modal.innerHTML = `
      <div class="portfolio-modal-content">
        <button class="portfolio-modal-close" onclick="closePortfolioModal()">&times;</button>
        <img id="pm-img" src="" alt="Project">
        <h3 id="pm-title"></h3>
        <p id="pm-category"></p>
        <a id="pm-link" class="btn btn-primary btn-pulse" href="#" target="_blank">View Live Demo &rarr;</a>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('pm-img').src = img;
  document.getElementById('pm-title').textContent = title;
  document.getElementById('pm-category').textContent = category;
  document.getElementById('pm-link').href = link;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // prevent background scrolling
}

function closePortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* 
 * I18N / Multi-language Logic
 */
function initI18n() {
  applyLanguage(currentLang);

  // Listen for clicks on the language switcher
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang');
      currentLang = lang;
      localStorage.setItem('ibnLang', lang);
      applyLanguage(lang);
    });
  });
}

function applyLanguage(lang) {
  if (!window.translations || !window.translations[lang]) return;

  const dictionary = window.translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dictionary[key]) {
      // Find the first text node child to update, preserving other children like SVGs
      const textNode = Array.from(el.childNodes).find(node => node.nodeType === 3); // 3 = Node.TEXT_NODE
      if (textNode) {
        textNode.nodeValue = dictionary[key] + (el.hasAttribute('data-i18n-suffix') ? el.getAttribute('data-i18n-suffix') : '');
      } else {
        el.textContent = dictionary[key];
      }
    }
  });

  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
    document.body.classList.add('rtl-mode');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.remove('rtl-mode');
  }

  // Update active state in switcher UI and navbar text
  const langText = document.getElementById('current-lang-text');
  if (langText) langText.textContent = lang.toUpperCase();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Re-hydrate dynamic content for the new language
  hydrateWebsite();
}

/* 
 * UI Enhancements
 */
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.classList.toggle('nav-open');
  });

  // Close menu when clicking links (for mobile UX)
  const navLinks = nav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Don't close the menu if it's a dropdown trigger (let the user see the languages/services)
      if (link.classList.contains('dropdown-trigger')) return;

      btn.classList.remove('active');
      nav.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
}

function initScrollAnimations() {
  const els = document.querySelectorAll('.scroll-anim:not(.observed)');
  if (!els.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach(el => { el.classList.add('is-visible'); el.classList.add('observed'); });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => {
    obs.observe(el);
    el.classList.add('observed');
  });
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Background darken on scroll
        if (currentY > 50) {
          header.classList.add('scrolled');
          header.style.background = 'rgba(2, 6, 23, 0.95)';
        } else {
          header.classList.remove('scrolled');
          header.style.background = 'rgba(2, 6, 23, 0.8)';
        }

        // Auto-hide on scroll down, reveal on scroll up (mobile only)
        if (window.innerWidth <= 768) {
          const navOpen = document.body.classList.contains('nav-open');
          if (!navOpen) {
            if (currentY > lastScrollY && currentY > 80) {
              header.classList.add('header-hidden');
            } else {
              header.classList.remove('header-hidden');
            }
          }
        } else {
          header.classList.remove('header-hidden');
        }

        lastScrollY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  });
}


/* 
 * GUIDED FLOW MODAL LOGIC
 */
function openModal(serviceName) {
  currentService = serviceName;
  const serviceEl = document.getElementById('selectedServiceText');
  if (serviceEl) serviceEl.textContent = serviceName;

  const bizNameInput = document.getElementById('bizNameInput');
  const bizCityInput = document.getElementById('bizCityInput');
  if (bizNameInput) bizNameInput.value = '';
  if (bizCityInput) bizCityInput.value = '';

  const needsInput = document.getElementById('bizNeedsInput');
  if (needsInput) {
    if (serviceName.includes('E-commerce')) {
      needsInput.value = 'Full E-commerce Setup';
    } else if (serviceName.includes('Menu')) {
      needsInput.value = 'Website + WhatsApp Ordering';
    } else if (serviceName.includes('Rental')) {
      needsInput.value = 'Booking/Reservation System';
    } else {
      needsInput.value = 'Just a simple Landing Page';
    }
  }

  goToStep(1);
  const modal = document.getElementById('flowModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeModal() {
  const modal = document.getElementById('flowModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

function nextStep(stepNumber) {
  if (stepNumber === 3) {
    const bizNameInput = document.getElementById('bizNameInput');
    const cityInput = document.getElementById('bizCityInput');
    const bizName = bizNameInput ? bizNameInput.value.trim() : '';
    const city = cityInput ? cityInput.value.trim() : '';

    if (!bizName || !city) {
      alert("Please fill in your Business Name and City to continue.");
      return;
    }

    const summaryService = document.getElementById('summary-service');
    const summaryName = document.getElementById('summary-name');
    const summaryCity = document.getElementById('summary-city');
    if (summaryService) summaryService.textContent = currentService;
    if (summaryName) summaryName.textContent = bizName;
    if (summaryCity) summaryCity.textContent = city;
  }

  goToStep(stepNumber);
}

function goToStep(stepNumber) {
  document.querySelectorAll('.modal-step').forEach(step => step.classList.remove('active'));
  const stepEl = document.getElementById(`step${stepNumber}`);
  if (stepEl) stepEl.classList.add('active');

  const indicators = [
    document.getElementById('step1-indicator'),
    document.getElementById('step2-indicator'),
    document.getElementById('step3-indicator')
  ];

  indicators.forEach(ind => { if (ind) ind.className = 'step'; });

  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  if (line1) line1.className = 'step-line';
  if (line2) line2.className = 'step-line';

  if (stepNumber >= 1 && indicators[0]) indicators[0].classList.add('active');
  if (stepNumber >= 2) {
    if (indicators[0]) indicators[0].classList.add('completed');
    if (line1) line1.classList.add('active');
    if (indicators[1]) indicators[1].classList.add('active');
  }
  if (stepNumber >= 3) {
    if (indicators[1]) indicators[1].classList.add('completed');
    if (line2) line2.classList.add('active');
    if (indicators[2]) indicators[2].classList.add('active');
  }
}

function submitFlow() {
  const bizTypeInput = document.getElementById('bizTypeInput');
  const bizNameInput = document.getElementById('bizNameInput');
  const cityInput = document.getElementById('bizCityInput');
  const needsInput = document.getElementById('bizNeedsInput');

  const bizType = bizTypeInput ? bizTypeInput.value : '';
  const bizName = bizNameInput ? bizNameInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : '';
  const needs = needsInput ? needsInput.value : '';

  const msg = `Hello, I'm interested in the [${currentService}].\n\nBusiness: ${bizName}\nType: ${bizType}\nCity: ${city}\nDetails: ${needs}\n\nI want to start this project!`;

  const waNum = '212717430045';
  const url = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

  window.open(url, '_blank');
  closeModal();
}


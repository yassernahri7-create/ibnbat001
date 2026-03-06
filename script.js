'use strict';

const STORAGE_KEY = 'IbnBatoutaWeb_admin_only_v1';
const LANG_KEY = 'IbnBatoutaWeb_lang';

const TRANSLATIONS = {
  fr: {
    top_quote: "Devis Gratuit",
    top_income: "Revenus générés pour nos clients",
    nav_home: "ACCUEIL",
    nav_about: "À PROPOS DE NOUS",
    nav_services: "SERVICES",
    nav_contact: "CONTACT",
    btn_contact: "CONTACTEZ-NOUS",
    hero_title: "Ibn Batouta Web<br>Digitalisation de<br>commerces locaux",
    hero_desc: "Vous êtes propriétaire d'un commerce local ou d'une petite entreprise ? Nous vous aidons à passer au numérique pour attirer plus de clients, moderniser votre image et rester plus proche de votre clientèle fidèle.",
    hero_form_label: "REMPLISSEZ LE FORMULAIRE CI-DESSOUS POUR ÊTRE CONTACTÉ",
    hero_phone_ph: "Votre numéro de téléphone *",
    hero_form_btn: "JE COMMENCE",
    hero_form_disclaimer: "En soumettant, vous serez redirigé vers WhatsApp pour nous contacter directement",
    partners_title: "NOS<br>PARTENAIRES",
    about_title: "QUI SOMMES <span class=\"circled\">NOUS</span>",
    about_p1: "<strong class=\"blue-text\">Ibn Batouta Web</strong> est votre partenaire de confiance pour la transformation digitale des commerces de proximité. Notre mission est d'aider les entrepreneurs locaux à franchir le pas vers le monde du numérique tout en valorisant leur savoir-faire.",
    about_p2: "<strong class=\"blue-text\">Prêts à franchir le pas ?</strong> Notre équipe dédiée accompagne les commerçants, artisans et PME pour booster leur visibilité locale, attirer de nouveaux clients et simplifier leurs interactions quotidiennes grâce à des solutions technologiques accessibles.",
    tm_1: "Nos clients ont augmenté leur visibilité en ligne de 50%.",
    tm_2: "Grâce à notre accompagnement, leurs ventes en ligne ont progressé de 80%.",
    tm_3: "Les campagnes menées ont généré une hausse de 40 % de l'engagement sur les réseaux sociaux.",
    tm_4: "Par ailleurs, nos stratégies SEO leur ont permis d'atteindre la première page de Google pour plus de 15 mots-clés.",
    services_overline: "NOS SERVICES",
    services_title: "Nos solutions pour<br>votre commerce local",
    work_title: "Découvrez Nos Réalisations",
    work_desc: "Des projets qui ont fait la différence pour nos clients.",
    contact_title: "Prêt à accélérer<br>votre <span class=\"blue-text\">croissance</span> ?",
    contact_desc: "Contactez-nous aujourd'hui pour une consultation gratuite et découvrez comment nous pouvons transformer votre présence en ligne.",
    contact_name_ph: "Votre Nom Complet",
    contact_info_ph: "Votre Téléphone / WhatsApp",
    contact_svc_ph: "De quel service avez-vous besoin ?",
    contact_msg_ph: "Parlez-nous de votre projet...",
    contact_btn: "OBTENIR UN DEVIS",
    footer_desc: "Partenaire de la transformation digitale locale, nous aidons les commerces à s'épanouir dans le monde numérique.",
    footer_follow: "Suivez-nous",
    footer_rights: "© 2026 Ibn Batouta Web. Tous droits réservés."
  },
  en: {
    top_quote: "Free Quote",
    top_income: "Revenue generated for our clients",
    nav_home: "HOME",
    nav_about: "ABOUT US",
    nav_services: "SERVICES",
    nav_contact: "CONTACT",
    btn_contact: "CONTACT US",
    hero_title: "Ibn Batouta Web<br>Digitalizing<br>Local Businesses",
    hero_desc: "Are you a local shop owner or a small business owner? We help you go digital to attract more customers, modernize your image, and stay closer to your loyal clients.",
    hero_form_label: "FILL OUT THE FORM BELOW TO BE CONTACTED",
    hero_phone_ph: "Your phone number *",
    hero_form_btn: "GET STARTED",
    hero_form_disclaimer: "By submitting, you will be redirected to WhatsApp to contact us directly",
    partners_title: "OUR<br>PARTNERS",
    about_title: "WHO ARE <span class=\"circled\">WE</span>",
    about_p1: "<strong class=\"blue-text\">Ibn Batouta Web</strong> is your trusted partner for the digital transformation of local shops. Our mission is to help local entrepreneurs take the step into the digital world while promoting their expertise.",
    about_p2: "<strong class=\"blue-text\">Ready to take the step?</strong> Our dedicated team supports shopkeepers, artisans, and SMEs to boost their local visibility, attract new customers, and simplify their daily interactions through accessible technological solutions.",
    tm_1: "Our clients increased their online visibility by 50%.",
    tm_2: "Thanks to our support, their online sales grew by 80%.",
    tm_3: "Conducted campaigns generated a 40% increase in social media engagement.",
    tm_4: "Furthermore, our SEO strategies allowed them to reach the first page of Google for more than 15 keywords.",
    services_overline: "OUR SERVICES",
    services_title: "Our solutions for<br>your local business",
    work_title: "Discover Our Achievements",
    work_desc: "Projects that have made a difference for our clients.",
    contact_title: "Ready to accelerate<br>your <span class=\"blue-text\">growth</span>?",
    contact_desc: "Contact us today for a free consultation and discover how we can transform your online presence.",
    contact_name_ph: "Your Full Name",
    contact_info_ph: "Your Phone / WhatsApp",
    contact_svc_ph: "Which service do you need?",
    contact_msg_ph: "Tell us about your project...",
    contact_btn: "GET A QUOTE",
    footer_desc: "Partner in local digital transformation, helping businesses thrive in the digital world.",
    footer_follow: "Follow us",
    footer_rights: "© 2026 Ibn Batouta Web. All rights reserved."
  },
  ar: {
    top_quote: "طلب عرض سعر مجاني",
    top_income: "الإيرادات المحققة لعملائنا",
    nav_home: "الرئيسية",
    nav_about: "من نحن",
    nav_services: "خدماتنا",
    nav_contact: "اتصل بنا",
    btn_contact: "اتصل بنا",
    hero_title: "Ibn Batouta Web<br>تحويل المحلات<br>إلى العالم الرقمي",
    hero_desc: "هل أنت صاحب محل تجاري محلي أو صاحب مشروع صغير؟ نحن نساعدك على التحول إلى العالم الرقمي لجذب المزيد من العملاء، وتحديث صورتك، والبقاء أقرب إلى زبنائك الأوفياء.",
    hero_form_label: "املأ النموذج أدناه ليتم الاتصال بك",
    hero_phone_ph: "رقم هاتفك *",
    hero_form_btn: "ابدأ الآن",
    hero_form_disclaimer: "بإرسالك ، سيتم توجيهك إلى واتساب للاتصال بنا مباشرة",
    partners_title: "شركاؤنا",
    about_title: "من <span class=\"circled\">نحن</span>",
    about_p1: "<strong class=\"blue-text\">Ibn Batouta Web</strong> هي شريكك الموثوق للتحول الرقمي للمحلات التجارية المحلية. مهمتنا هي مساعدة المقاولين المحليين على الانتقال إلى العالم الرقمي مع تثمين خبراتهم.",
    about_p2: "<strong class=\"blue-text\">مستعد للمضي قدماً؟</strong> يقوم فريقنا بدعم التجار، الحرفيين والمقاولات الصغرى والمتوسطة لتعزيز ظهورهم المحلي، وجذب زبناء جدد، وتبسيط تفاعلاتهم اليومية من خلال حلول تكنولوجية مناسبة.",
    tm_1: "زاد عملاؤنا من ظهورهم عبر الإنترنت بنسبة 50٪.",
    tm_2: "بفضل دعمنا ، نمت مبيعاتهم عبر الإنترنت بنسبة 80٪.",
    tm_3: "أدت الحملات التي تم إجراؤها إلى زيادة بنسبة 40٪ في التفاعل على وسائل التواصل الاجتماعي.",
    tm_4: "علاوة على ذلك ، سمحت لهم استراتيجيات تحسين محركات البحث لدينا بالوصول إلى الصفحة الأولى من جوجل لأكثر من 15 كلمة رئيسية.",
    services_overline: "خدماتنا",
    services_title: "حلولنا الخاصة<br>بمشروعك المحلي",
    work_title: "اكتشف إنجازاتنا",
    work_desc: "مشاريع أحدثت فرقاً لعملائنا.",
    contact_title: "مستعد لتسريع<br><span class=\"blue-text\">نموك</span>؟",
    contact_desc: "اتصل بنا اليوم للحصول على استشارة مجانية واكتشف كيف يمكننا تحويل تواجدك عبر الإنترنت.",
    contact_name_ph: "اسمك الكامل",
    contact_info_ph: "هاتفك / واتساب",
    contact_svc_ph: "ما هي الخدمة التي تحتاجها؟",
    contact_msg_ph: "أخبرنا عن مشروعك...",
    contact_btn: "احصل على عرض سعر",
    footer_desc: "شريك في التحول الرقمي المحلي، نساعد الشركات على الازدهار في العالم الرقمي.",
    footer_follow: "تابعنا",
    footer_rights: "© 2026 Ibn Batouta Web. جميع الحقوق محفوظة."
  }
};

let currentServices = getStorage().services && getStorage().services.length ? getStorage().services : [
  {
    fr: { title: '🌐 Site Web Pro — 999 DH', desc: 'Votre vitrine digitale clé en main.', features: ['Design sur-mesure', 'Responsive', 'WhatsApp intégré'], stat: '75% des clients...', price: '999 DH' },
    en: { title: '🌐 Professional Website — 999 DH', desc: 'Your turnkey digital showcase.', features: ['Custom Design', 'Responsive', 'WhatsApp integrated'], stat: '75% of clients...', price: '999 DH' },
    ar: { title: '🌐 موقع احترافي — 999 درهم', desc: 'واجهتك الرقمية بلمسة واحدة.', features: ['تصميم مخصص', 'متجاوب', 'واتساب مدمج'], stat: '75% من العملاء...', price: '999 درهم' }
  },
  {
    fr: { title: '📱 Réseaux Sociaux + SEO — 400 DH', desc: 'Gestion Facebook/Insta + SEO.', features: ['12 posts/mois', 'SEO On-Page', 'Google Maps'], stat: 'Hausse de 60%...', price: '400 DH/mois' },
    en: { title: '📱 Social Media + SEO — 400 DH', desc: 'Facebook/Insta Management + SEO.', features: ['12 posts/month', 'SEO On-Page', 'Google Maps'], stat: '60% increase...', price: '400 DH/month' },
    ar: { title: '📱 وسائل التواصل + SEO — 400 درهم', desc: 'إدارة فيسبوك/إنستا + تحسين محركات البحث.', features: ['12 منشور/شهر', 'تحسين محركات البحث', 'خرائط جوجل'], stat: 'زيادة بنسبة 60٪...', price: '400 درهم/شهر' }
  },
  {
    fr: { title: '🚀 App Sur-Mesure — 4 000 DH', desc: 'Menu digital, Location voiture...', features: ['Panel Admin', 'Base de données', 'Formation'], stat: '+35% de commandes...', price: '4 000 DH' },
    en: { title: '🚀 Custom App — 4,000 DH', desc: 'Digital Menu, Car Rental...', features: ['Admin Panel', 'Database', 'Training'], stat: '+35% orders...', price: '4,000 DH' },
    ar: { title: '🚀 تطبيق مخصص — 4,000 درهم', desc: 'منيو رقمي، كراء سيارات...', features: ['لوحة تحكم', 'قاعدة بيانات', 'تدريب'], stat: '+35٪ طلبات...', price: '4,000 درهم' }
  },
  {
    fr: { title: '📍 Google Maps Pro — 200 DH', desc: 'Optimisation fiche locale.', features: ['Fiche Business', 'Avis 5 étoiles', 'Photos'], stat: '46% des recherches...', price: '200 DH' },
    en: { title: '📍 Google Maps Pro — 200 DH', desc: 'Local listing optimization.', features: ['Business Listing', '5-star reviews', 'Photos'], stat: '46% of searches...', price: '200 DH' },
    ar: { title: '📍 خرائط جوجل برو — 200 درهم', desc: 'تحسين النشاط التجاري المحلي.', features: ['ملف تجاري', 'تقييمات 5 نجوم', 'صور'], stat: '46٪ من الأبحاث...', price: '200 درهم' }
  },
  {
    fr: { title: '👑 Pack Domination — 4 999 DH', desc: 'L\'offre ultime tout-en-un.', features: ['Tout inclus', 'Logo offert', 'Hébergement 1 an'], stat: 'ROI immédiat...', price: '4 999 DH' },
    en: { title: '👑 Domination Pack — 4,999 DH', desc: 'The ultimate all-in-one offer.', features: ['All included', 'Free Logo', '1 Year Hosting'], stat: 'Immediate ROI...', price: '4,999 DH' },
    ar: { title: '👑 باقة السيطرة — 4,999 درهم', desc: 'العرض الشامل النهائي.', features: ['كل شيء متضمن', 'شعار مجاني', 'استضافة لمدة عام'], stat: 'عائد استثمار فوري...', price: '4,999 درهم' }
  }
];

/* ═══ INIT ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const data = getStorage();
  let currentLang = localStorage.getItem(LANG_KEY) || 'fr';

  applyBrand(data.brand);
  applyPromo(data.promo);
  applySocial(data.social);

  initLanguage(currentLang);

  // Language Switcher Events
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      switchLanguage(lang);
    });
  });

  // Render static data-driven parts
  renderProjectsUI(data.projects || []);

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    // Populate select with current services
    const select = document.getElementById('bizType');
    if (select) {
      const defaultOptions = select.innerHTML;
      const serviceOptions = currentServices.map(s => {
        const title = (s[currentLang] || s['fr']).title.split('—')[0].trim();
        return `<option>${title}</option>`;
      }).join('');
      select.innerHTML = `<option value="" disabled selected>${currentLang === 'ar' ? 'ما هي الخدمة التي تحتاجها؟' : 'De quel service avez-vous besoin ?'}</option>` + serviceOptions;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      submitForm(data.social?.whatsapp || '212717430045');
    });
  }

  // Hero mini form
  const heroForm = document.getElementById('heroMiniForm');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const phone = document.getElementById('heroPhone')?.value?.trim();
      if (phone) {
        const waNum = data.social?.whatsapp || '212717430045';
        const msg = currentLang === 'ar' ? `مرحباً Ibn Batouta Web! 👋\nأنا مهتم بخدماتكم.\nرقم هاتفي: ${phone}\nشكراً لتواصلكم معي!` : `Bonjour Ibn Batouta Web ! 👋\nJe suis intéressé par vos services.\nMon numéro: ${phone}\nMerci de me recontacter !`;
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    });
  }

  // Mobile nav
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.innerHTML = nav.classList.contains('open') ? '&#10005;' : '&#9776;';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.innerHTML = '&#9776;';
    }));
  }

  initReveal();
  animateCounter();
});

/* ═══ Language Management ════════════════════════════════════════════ */
function initLanguage(lang) {
  switchLanguage(lang);
}

function switchLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Update buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Translate UI elements
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.innerHTML = dict[key];
  });

  // Translate Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  // Re-render services with current lang
  renderServicesUI(currentServices, lang);
}

/* ═══ Brand ══════════════════════════════════════════════════════════ */
function applyBrand(brand) {
  if (!brand) return;
  if (brand.logo) {
    document.querySelectorAll('.brand').forEach(el => {
      el.innerHTML = `<img src="${brand.logo}" alt="Logo" class="brand-logo-img">`;
    });
  }
}

function applyPromo(promo) {
  const banner = document.getElementById('promoBanner');
  if (!banner || !promo?.enabled || !promo.text) return;
  banner.style.display = 'block';
  banner.innerHTML = promo.link ? `<a href="${promo.link}">${promo.text}</a>` : promo.text;
}

function applySocial(social) {
  if (!social) return;

  // Instagram
  if (social.insta) {
    document.querySelectorAll('.ig-link').forEach(el => el.href = social.insta);
  }

  // Facebook
  if (social.fb) {
    document.querySelectorAll('.fb-link').forEach(el => el.href = social.fb);
  }

  // WhatsApp
  if (social.whatsapp) {
    const waUrl = `https://wa.me/${social.whatsapp}`;
    document.querySelectorAll('.wa-link').forEach(el => el.href = waUrl);

    const waFloating = document.getElementById('floatingWa');
    if (waFloating) waFloating.href = waUrl;

    document.querySelectorAll('.phone-text').forEach(el => {
      const num = social.whatsapp.replace(/^212/, '');
      el.textContent = `+212 ${num}`;
    });

    document.querySelectorAll('.top-wa').forEach(el => el.href = waUrl);
  }

  // Email
  if (social.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${social.email}`;
      el.textContent = social.email;
    });
  }
}

function renderServicesUI(svcs, lang) {
  const tabsEl = document.getElementById('serviceTabs');
  const contentEl = document.getElementById('serviceContent');
  if (!tabsEl || !contentEl) return;

  tabsEl.innerHTML = svcs.map((s, i) => {
    const data = s[lang] || s['fr'];
    // Extract price from title if possible or use data.price
    const priceMatch = data.title.match(/(\d[\d\s]*\d\s*(DH|درهم)(\/mois)?)/i);
    const shelfPrice = priceMatch ? priceMatch[0] : (data.price || '');
    const cleanTitle = data.title.replace(shelfPrice, '').replace(/—\s*$/, '').trim();

    return `
      <div class="service-tab ${i === 0 ? 'active' : ''}" data-tab="${i}" role="button" tabindex="0">
        <div class="tab-main">
          <span class="tab-title">${cleanTitle}</span>
          ${shelfPrice ? `<span class="tab-price-badge">${shelfPrice}</span>` : ''}
        </div>
        <span class="tab-arrow">→</span>
      </div>
    `;
  }).join('');

  contentEl.innerHTML = svcs.map((s, i) => {
    const data = s[lang] || s['fr'];
    const feats = (data.features || []).map(f => `<li><span class="check">✓</span><span>${f}</span></li>`).join('');
    return `
      <div class="service-panel ${i === 0 ? 'active' : ''}" data-panel="${i}">
        <h3>${data.title}</h3>
        <p class="panel-desc">${data.desc || ''}</p>
        <ul class="panel-features">${feats}</ul>
        ${data.stat ? `<div class="panel-stat"><span class="arrow-up">↑</span><p>${data.stat}</p></div>` : ''}
        ${data.price ? `<div class="panel-price-tag"><span class="price-icon-sparkle">⚡</span><span class="price-amount">${data.price}</span></div>` : ''}
        <a href="#contact" class="btn btn-dark" data-i18n="contact_btn">${TRANSLATIONS[lang].contact_btn} →</a>
      </div>
    `;
  }).join('');

  tabsEl.querySelectorAll('.service-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.service-tab').forEach(t => t.classList.remove('active'));
      contentEl.querySelectorAll('.service-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      contentEl.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });
}

function renderProjectsUI(projects) {
  const c = document.getElementById('projectsContainer');
  if (!c) return;
  const fallback = [
    { title: "Nour Market", category: "Commerce", images: [] },
    { title: "Café Paris", category: "Restaurant", images: [] },
    { title: "Dr. Lahlou", category: "Santé", images: [] }
  ];
  const items = projects.length ? projects : fallback;

  c.innerHTML = items.map((p, idx) => {
    // Backward compat: convert old single image to images array
    const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    const safeImgs = JSON.stringify(imgs).replace(/'/g, "\\'");

    const thumbStrip = imgs.length > 0
      ? `<div class="project-imgs-strip">
          ${imgs.map((src, j) => `<img src="${src}" alt="${p.title} ${j + 1}" class="strip-img" onclick="event.stopPropagation(); openGalleryLightbox(${idx}, ${j})">`).join('')}
         </div>`
      : `<div style="width:100%;height:210px;background:linear-gradient(135deg,#eee,#ddd);display:flex;align-items:center;justify-content:center;font-size:2rem;color:#bbb;">🌐</div>`;

    return `
    <article class="project-card reveal">
      <div class="project-thumb" onclick="openGalleryLightbox(${idx}, 0)">
        ${thumbStrip}
        <div class="project-overlay">
           <span>🔍 ${imgs.length} photo${imgs.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="project-info">
        <h3>${p.title}</h3>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="chip">${p.category || ''}</span>
          ${p.link ? `<a href="${p.link}" target="_blank" class="project-link" onclick="event.stopPropagation()">Visiter &rarr;</a>` : ''}
        </div>
      </div>
    </article>
    `;
  }).join('');

  // Store reference for lightbox navigation
  window._galleryProjects = items;
}

window.openGalleryLightbox = function (projIdx, imgIdx) {
  const proj = window._galleryProjects?.[projIdx];
  if (!proj) return;
  const imgs = proj.images && proj.images.length ? proj.images : (proj.image ? [proj.image] : []);
  if (!imgs.length) return;

  let current = imgIdx || 0;

  const lb = document.createElement('div');
  lb.className = 'lightbox-overlay';

  function render() {
    lb.innerHTML = `
      <div class="lightbox-close">&times;</div>
      <div class="lightbox-counter">${current + 1} / ${imgs.length}</div>
      ${imgs.length > 1 ? `<div class="lightbox-prev">&lsaquo;</div>` : ''}
      ${imgs.length > 1 ? `<div class="lightbox-next">&rsaquo;</div>` : ''}
      <img src="${imgs[current]}" class="lightbox-img">
    `;

    lb.querySelector('.lightbox-close').onclick = (e) => { e.stopPropagation(); close(); };
    if (imgs.length > 1) {
      lb.querySelector('.lightbox-prev').onclick = (e) => { e.stopPropagation(); current = (current - 1 + imgs.length) % imgs.length; render(); };
      lb.querySelector('.lightbox-next').onclick = (e) => { e.stopPropagation(); current = (current + 1) % imgs.length; render(); };
    }
  }

  function close() {
    document.removeEventListener('keydown', keyHandler);
    document.body.removeChild(lb);
  }

  function keyHandler(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' && imgs.length > 1) { current = (current + 1) % imgs.length; render(); }
    if (e.key === 'ArrowLeft' && imgs.length > 1) { current = (current - 1 + imgs.length) % imgs.length; render(); }
  }

  lb.onclick = close;
  document.addEventListener('keydown', keyHandler);
  render();
  document.body.appendChild(lb);
};

function submitForm(waNumber) {
  const lang = localStorage.getItem(LANG_KEY) || 'fr';
  const name = (document.getElementById('name')?.value || '').trim();
  const contact = (document.getElementById('contactInfo')?.value || '').trim();
  const service = (document.getElementById('bizType')?.value || '').trim();
  const msg = (document.getElementById('message')?.value || '').trim();
  if (!name || !contact) { alert(lang === 'ar' ? 'يرجى ملء الاسم ومعلومات الاتصال.' : 'Veuillez renseigner votre nom et vos coordonnées.'); return; }
  const text = lang === 'ar' ? `مرحباً ibnbatoutaweb! 👋\n\nأود الحصول على عرض سعر.\n\nالاسم: ${name}\nالاتصال: ${contact}\nالخدمة: ${service}\n\nالتفاصيل:\n${msg}` : `Bonjour ibnbatoutaweb ! 👋\n\nJe voudrais obtenir un devis.\n\nNom: ${name}\nContact: ${contact}\nService: ${service}\n\nDétails:\n${msg}`;
  fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, contact, service, msg, lang }) }).catch(() => { });
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || typeof IntersectionObserver === 'undefined') { els.forEach(el => el.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

function animateCounter() {
  const el = document.querySelector('.counter');
  if (!el) return;
  const target = 2120240443;
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current.toLocaleString(localStorage.getItem(LANG_KEY) === 'ar' ? 'ar-EG' : 'fr-FR');
  }, 25);
}

function getStorage() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }

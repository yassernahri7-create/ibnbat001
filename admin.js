'use strict';

const STORAGE_KEY = 'IbnBatoutaWeb_admin_only_v1';
const SESSION_KEY = 'IbnBatoutaWeb_admin_session_v1';

// Same default as the frontend to hydrate if empty
const DEFAULT_SERVICES = [
  {
    fr: { title: '🌐 Site Web Pro — 999 DH', desc: 'Votre vitrine digitale clé en main.', features: 'Design sur-mesure\nResponsive\nWhatsApp intégré', stat: '75% des clients...' },
    en: { title: '🌐 Professional Website — 999 DH', desc: 'Your turnkey digital showcase.', features: 'Custom Design\nResponsive\nWhatsApp integrated', stat: '75% of clients...' },
    ar: { title: '🌐 موقع احترافي — 999 درهم', desc: 'واجهتك الرقمية بلمسة واحدة.', features: 'تصميم مخصص\nمتجاوب\nواتساب مدمج', stat: '75% من العملاء...' }
  }
];

document.addEventListener('DOMContentLoaded', async () => {
  let data = getStorage();

  // 1. Initial Data Fetch
  try {
    const res = await fetch('/api/config?v=' + Date.now());
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && Object.keys(serverData).length) {
        data = serverData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
  } catch (e) { console.warn('Server config fetch failed', e); }

  // Mobile Menu Logic
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  // 0. AUTHENTICATION CHECK
  const session = localStorage.getItem(SESSION_KEY);
  const loginOverlay = document.getElementById('loginOverlay');

  if (!session) {
    loginOverlay.style.display = 'flex';
  }

  // Define admin default if missing
  if (!data.admin) {
    data.admin = { user: 'admin', pass: 'admin' };
  }

  // Login Logic
  document.getElementById('loginSubmit').addEventListener('click', () => {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const errorEl = document.getElementById('loginError');

    if (u === data.admin.user && p === data.admin.pass) {
      localStorage.setItem(SESSION_KEY, 'true');
      loginOverlay.style.opacity = '0';
      setTimeout(() => loginOverlay.style.display = 'none', 300);
      showToast('Bienvenue ! Connexion réussie.');
    } else {
      errorEl.style.display = 'block';
      setTimeout(() => errorEl.style.display = 'none', 3000);
    }
  });

  // Logout Logic
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });

  window.social = data.social || { whatsapp: '', insta: '', fb: '' };
  window.packs = data.services && data.services.length ? data.services : JSON.parse(JSON.stringify(DEFAULT_SERVICES));
  window.gallery = data.projects || [];
  window.brand = data.brand || { logo: '' };
  window.promo = data.promo || { enabled: false, text: '', link: '' };

  window.showToast = function (message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `✅ ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  window.autoSave = function (message) {
    document.getElementById('saveAllBtn').click();
    if (message) showToast(message);
  };

  // Sidebar navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.panel-section');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');

      if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
        toggleSidebar();
      }
    });
  });

  /* ── 1. SOCIALS ── */
  v('waNum', window.social.whatsapp);
  v('igLink', window.social.insta);
  v('fbLink', window.social.fb);

  /* ── 1.1 SECURITY ── */
  v('adminUser', data.admin.user);
  v('adminPass', data.admin.pass);

  /* ── 1.2 BRAND & PROMO ── */
  v('logoUrl', window.brand.logo);
  const promoCheck = document.getElementById('promoEnabled');
  if (promoCheck) promoCheck.checked = window.promo.enabled;
  v('promoText', window.promo.text);
  v('promoLink', window.promo.link);

  document.getElementById('logoUrl')?.addEventListener('change', e => { window.brand.logo = e.target.value; autoSave(); });
  document.getElementById('promoEnabled')?.addEventListener('change', e => { window.promo.enabled = e.target.checked; autoSave(); });
  document.getElementById('promoText')?.addEventListener('change', e => { window.promo.text = e.target.value; autoSave(); });
  document.getElementById('promoLink')?.addEventListener('change', e => { window.promo.link = e.target.value; autoSave(); });

  /* ── 2. PACKS & SERVICES ── */
  const packsContainer = document.getElementById('packsContainer');

  function renderPacks() {
    packsContainer.innerHTML = window.packs.map((pack, i) => {
      if (!pack.fr) pack.fr = { title: '', desc: '', features: '', stat: '' };
      if (!pack.en) pack.en = { title: '', desc: '', features: '', stat: '' };
      if (!pack.ar) pack.ar = { title: '', desc: '', features: '', stat: '' };

      const renderFeatures = (langPack) => Array.isArray(langPack.features) ? langPack.features.join('\n') : langPack.features;

      return `
      <div class="service-item">
        <div class="item-actions">
          <button class="btn btn-move" onclick="movePack(${i}, -1)" ${i === 0 ? 'disabled' : ''}>&uarr;</button>
          <button class="btn btn-move" onclick="movePack(${i}, 1)" ${i === window.packs.length - 1 ? 'disabled' : ''}>&darr;</button>
          <button class="btn btn-delete remove-pack" data-i="${i}">Supprimer</button>
        </div>
        <h3 style="margin-bottom:16px;">Plan / Pack #${i + 1}</h3>
        
        <div class="lang-tabs" id="tabGroup_${i}">
          <button class="l-tab active" onclick="switchPackLang(${i}, 'fr')">Français</button>
          <button class="l-tab" onclick="switchPackLang(${i}, 'en')">English</button>
          <button class="l-tab" onclick="switchPackLang(${i}, 'ar')">العربية</button>
        </div>

        <div class="pack-lang-content" id="pack_${i}_fr">
          <div class="grid-2">
            <div><label>Titre & Prix (FR)</label><input type="text" value="${esc(pack.fr.title)}" onchange="window.packs[${i}].fr.title=this.value; autoSave()"></div>
            <div><label>Petite Statistique (FR)</label><input type="text" value="${esc(pack.fr.stat)}" onchange="window.packs[${i}].fr.stat=this.value; autoSave()"></div>
          </div>
          <div><label>Description courte (FR)</label><input type="text" value="${esc(pack.fr.desc)}" onchange="window.packs[${i}].fr.desc=this.value; autoSave()"></div>
          <div><label>Fonctionnalités incluses (une par ligne)</label><textarea rows="3" onchange="window.packs[${i}].fr.features=this.value; autoSave()">${esc(renderFeatures(pack.fr))}</textarea></div>
        </div>

        <div class="pack-lang-content" id="pack_${i}_en" style="display:none;">
          <div class="grid-2">
            <div><label>Title & Price (EN)</label><input type="text" value="${esc(pack.en.title)}" onchange="window.packs[${i}].en.title=this.value; autoSave()"></div>
            <div><label>Highlight Stat (EN)</label><input type="text" value="${esc(pack.en.stat)}" onchange="window.packs[${i}].en.stat=this.value; autoSave()"></div>
          </div>
          <div><label>Short Description (EN)</label><input type="text" value="${esc(pack.en.desc)}" onchange="window.packs[${i}].en.desc=this.value; autoSave()"></div>
          <div><label>Included Features (one per line)</label><textarea rows="3" onchange="window.packs[${i}].en.features=this.value; autoSave()">${esc(renderFeatures(pack.en))}</textarea></div>
        </div>

        <div class="pack-lang-content" id="pack_${i}_ar" style="display:none;" dir="rtl">
          <div class="grid-2">
            <div><label>العنوان والسعر (AR)</label><input type="text" value="${esc(pack.ar.title)}" onchange="window.packs[${i}].ar.title=this.value; autoSave()"></div>
            <div><label>إحصائية صغيرة (AR)</label><input type="text" value="${esc(pack.ar.stat)}" onchange="window.packs[${i}].ar.stat=this.value; autoSave()"></div>
          </div>
          <div><label>وصف قصير (AR)</label><input type="text" value="${esc(pack.ar.desc)}" onchange="window.packs[${i}].ar.desc=this.value; autoSave()"></div>
          <div><label>الميزات المضمنة (واحدة في كل سطر)</label><textarea rows="3" onchange="window.packs[${i}].ar.features=this.value; autoSave()">${esc(renderFeatures(pack.ar))}</textarea></div>
        </div>
      </div>
      `;
    }).join('');

    packsContainer.querySelectorAll('.remove-pack').forEach(btn => {
      btn.addEventListener('click', () => {
        window.packs.splice(btn.dataset.i, 1);
        renderPacks();
        autoSave('Plan supprimé avec succès !');
      });
    });
  }

  window.movePack = function (i, dir) {
    const target = i + dir;
    if (target < 0 || target >= window.packs.length) return;
    [window.packs[i], window.packs[target]] = [window.packs[target], window.packs[i]];
    renderPacks();
    autoSave();
  };

  window.switchPackLang = function (idx, lang) {
    const group = document.getElementById(`tabGroup_${idx}`);
    group.querySelectorAll('.l-tab').forEach(t => {
      t.classList.toggle('active', t.textContent.toLowerCase().includes(lang === 'ar' ? 'العربية' : lang));
    });
    document.getElementById(`pack_${idx}_fr`).style.display = lang === 'fr' ? 'block' : 'none';
    document.getElementById(`pack_${idx}_en`).style.display = lang === 'en' ? 'block' : 'none';
    document.getElementById(`pack_${idx}_ar`).style.display = lang === 'ar' ? 'block' : 'none';
  };

  window.updatePack = function (i, lang, key, val) {
    window.packs[i][lang][key] = val;
    autoSave();
  };

  function addPackAction() {
    window.packs.push({
      fr: { title: 'Nouveau Plan', desc: '', features: '', stat: '' },
      en: { title: 'New Plan', desc: '', features: '', stat: '' },
      ar: { title: 'خطة جديدة', desc: '', features: '', stat: '' }
    });
    renderPacks();
    autoSave('Nouveau Plan ajouté et sauvegardé !');
    const packsBtn = document.querySelector('.nav-btn[data-target="packs"]');
    if (packsBtn) packsBtn.click();
    setTimeout(() => {
      const items = document.querySelectorAll('.service-item');
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  document.getElementById('addPackBtn').addEventListener('click', addPackAction);
  document.getElementById('sideAddBtn').addEventListener('click', addPackAction);
  renderPacks();

  /* ── 3. GALLERY ── */
  const galleryContainer = document.getElementById('galleryContainer');

  function renderGallery() {
    galleryContainer.innerHTML = window.gallery.map((item, i) => {
      return `
      <div class="project-item card">
        <div class="item-actions">
           <button class="btn btn-delete remove-gal" data-i="${i}">Supprimer</button>
        </div>
        <div class="grid-2">
           <div><label>Titre du Projet</label><input type="text" value="${esc(item.title)}" onchange="window.gallery[${i}].title=this.value; autoSave()"></div>
           <div><label>Catégorie</label><input type="text" value="${esc(item.category)}" onchange="window.gallery[${i}].category=this.value; autoSave()"></div>
        </div>
        <div><label>Lien du projet (optionnel)</label><input type="text" value="${esc(item.link)}" onchange="window.gallery[${i}].link=this.value; autoSave()"></div>
        
        <div class="upload-area">
          <label>Images du projet (Choisir depuis l'ordinateur/téléphone)</label>
          <div class="file-input-wrapper">
            <button class="btn btn-primary">📁 Sélectionner des images</button>
            <input type="file" multiple accept="image/*" onchange="handleImageUpload(${i}, this)">
          </div>
          <div class="gal-thumbs-grid" id="galGrid_${i}">
            ${(item.images || []).map((img, idx) => `
              <div class="gal-thumb">
                <img src="${img}" alt="preview">
                <button class="gal-thumb-del" onclick="removeGalImg(${i}, ${idx})">&times;</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    }).join('');

    galleryContainer.querySelectorAll('.remove-gal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.gallery.splice(btn.dataset.i, 1);
        renderGallery();
        autoSave('Projet supprimé avec succès !');
      });
    });
  }

  window.handleImageUpload = async function (projIdx, input) {
    const files = Array.from(input.files);
    if (!files.length) return;
    showToast(`Téléchargement de ${files.length} image(s)...`);
    for (const file of files) {
      try {
        const ext = file.name.split('.').pop();
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-extension': ext },
          body: file
        });
        if (res.ok) {
          const { url } = await res.json();
          if (!window.gallery[projIdx].images) window.gallery[projIdx].images = [];
          window.gallery[projIdx].images.push(url);
        }
      } catch (e) { console.error('Upload failed', e); }
    }
    renderGallery();
    autoSave('Images ajoutées avec succès !');
  };

  window.removeGalImg = function (projIdx, imgIdx) {
    window.gallery[projIdx].images.splice(imgIdx, 1);
    renderGallery();
    autoSave('Image retirée !');
  };

  function addGalleryAction() {
    window.gallery.push({ title: 'Nouveau Projet', category: 'Web', link: '', images: [] });
    renderGallery();
    autoSave('Nouveau Projet ajouté !');
    setTimeout(() => {
      const items = document.querySelectorAll('.project-item');
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  document.getElementById('addGalleryBtn').addEventListener('click', addGalleryAction);
  document.getElementById('sideAddGalBtn')?.addEventListener('click', addGalleryAction);
  renderGallery();

  /* ── SAVE ALL ── */
  document.getElementById('saveAllBtn').addEventListener('click', async () => {
    // We must ensure the 'features' are stored as an array of strings per language to match `script.js`
    const cleanedPacks = JSON.parse(JSON.stringify(window.packs));
    cleanedPacks.forEach(p => {
      if (typeof p.fr.features === 'string') p.fr.features = p.fr.features.split('\n').filter(Boolean);
      if (typeof p.en.features === 'string') p.en.features = p.en.features.split('\n').filter(Boolean);
      if (typeof p.ar.features === 'string') p.ar.features = p.ar.features.split('\n').filter(Boolean);
    });

    data.social = { whatsapp: val('waNum'), insta: val('igLink'), fb: val('fbLink') };
    data.admin = { user: val('adminUser'), pass: val('adminPass') };
    data.services = cleanedPacks;
    data.projects = window.gallery;
    data.brand = window.brand;
    data.promo = window.promo;

    setStorage(data);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) showToast('Sauvegardé sur le serveur !');
    } catch (e) {
      console.error('Server save failed', e);
      showToast('Erreur serveur (sauvegardé localement)');
    }

    const s = document.getElementById('saveStatus');
    s.innerHTML = `✅ Sauvegardé avec succès à ${new Date().toLocaleTimeString()} !`;
    s.className = 'save-status ok';
    setTimeout(() => {
      s.innerHTML = 'Prêt à enregistrer.';
      s.className = 'save-status';
    }, 3000);
  });

});

/* ── Helpers ── */
function v(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function val(id) { return (document.getElementById(id)?.value || '').trim(); }
function esc(s) { return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function getStorage() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function setStorage(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {
    console.error(e);
    if (window.showToast) {
      document.getElementById('toast-container').innerHTML = ''; // clear old
      window.showToast('Erreur : Stockage Plein ! Veuillez retirer de vieilles images.', true);
    }
  }
}

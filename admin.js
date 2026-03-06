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

document.addEventListener('DOMContentLoaded', () => {
  const data = getStorage();

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

  let social = data.social || { whatsapp: '', insta: '', fb: '' };
  let packs = data.services && data.services.length ? data.services : JSON.parse(JSON.stringify(DEFAULT_SERVICES));
  let gallery = data.projects || [];

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
      document.getElementById(btn.dataset.target).classList.add('active');
      if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
        toggleSidebar();
      }
    });
  });

  /* ── 1. SOCIALS ── */
  v('waNum', social.whatsapp);
  v('igLink', social.insta);
  v('fbLink', social.fb);

  /* ── 1.1 SECURITY ── */
  v('adminUser', data.admin.user);
  v('adminPass', data.admin.pass);

  /* ── 2. PACKS & SERVICES ── */
  const packsContainer = document.getElementById('packsContainer');

  function renderPacks() {
    packsContainer.innerHTML = packs.map((pack, i) => {
      // Safely ensure structure
      if (!pack.fr) pack.fr = { title: '', desc: '', features: '', stat: '' };
      if (!pack.en) pack.en = { title: '', desc: '', features: '', stat: '' };
      if (!pack.ar) pack.ar = { title: '', desc: '', features: '', stat: '' };

      // Convert arrays back to string for textareas (if stored as array from old script)
      const renderFeatures = (langPack) => Array.isArray(langPack.features) ? langPack.features.join('\n') : langPack.features;

      return `
      <div class="service-item">
        <div class="item-actions">
          <button class="btn btn-move" onclick="movePack(${i}, -1)" ${i === 0 ? 'disabled' : ''}>&uarr;</button>
          <button class="btn btn-move" onclick="movePack(${i}, 1)" ${i === packs.length - 1 ? 'disabled' : ''}>&darr;</button>
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
            <div><label>Titre & Prix (FR)</label><input type="text" value="${esc(pack.fr.title)}" onchange="updatePack(${i}, 'fr', 'title', this.value)"></div>
            <div><label>Petite Statistique (FR)</label><input type="text" value="${esc(pack.fr.stat)}" onchange="updatePack(${i}, 'fr', 'stat', this.value)"></div>
          </div>
          <div><label>Description courte (FR)</label><input type="text" value="${esc(pack.fr.desc)}" onchange="updatePack(${i}, 'fr', 'desc', this.value)"></div>
          <div><label>Fonctionnalités incluses (une par ligne)</label><textarea rows="3" onchange="updatePack(${i}, 'fr', 'features', this.value)">${esc(renderFeatures(pack.fr))}</textarea></div>
        </div>

        <div class="pack-lang-content" id="pack_${i}_en" style="display:none;">
          <div class="grid-2">
            <div><label>Title & Price (EN)</label><input type="text" value="${esc(pack.en.title)}" onchange="updatePack(${i}, 'en', 'title', this.value)"></div>
            <div><label>Highlight Stat (EN)</label><input type="text" value="${esc(pack.en.stat)}" onchange="updatePack(${i}, 'en', 'stat', this.value)"></div>
          </div>
          <div><label>Short Description (EN)</label><input type="text" value="${esc(pack.en.desc)}" onchange="updatePack(${i}, 'en', 'desc', this.value)"></div>
          <div><label>Included Features (one per line)</label><textarea rows="3" onchange="updatePack(${i}, 'en', 'features', this.value)">${esc(renderFeatures(pack.en))}</textarea></div>
        </div>

        <div class="pack-lang-content" id="pack_${i}_ar" style="display:none;" dir="rtl">
          <div class="grid-2">
            <div><label>العنوان والسعر (AR)</label><input type="text" value="${esc(pack.ar.title)}" onchange="updatePack(${i}, 'ar', 'title', this.value)"></div>
            <div><label>إحصائية بارزة (AR)</label><input type="text" value="${esc(pack.ar.stat)}" onchange="updatePack(${i}, 'ar', 'stat', this.value)"></div>
          </div>
          <div><label>وصف قصير (AR)</label><input type="text" value="${esc(pack.ar.desc)}" onchange="updatePack(${i}, 'ar', 'desc', this.value)"></div>
          <div><label>الميزات المضمنة (واحدة في كل سطر)</label><textarea rows="3" onchange="updatePack(${i}, 'ar', 'features', this.value)">${esc(renderFeatures(pack.ar))}</textarea></div>
        </div>
      </div>
      `;
    }).join('');

    document.querySelectorAll('.remove-pack').forEach(b => b.addEventListener('click', (e) => {
      packs.splice(Number(e.target.dataset.i), 1);
      renderPacks();
      autoSave('Plan supprimé avec succès !');
    }));
  }

  window.movePack = function (index, direction) {
    const target = index + direction;
    if (target < 0 || target >= packs.length) return;
    const temp = packs[index];
    packs[index] = packs[target];
    packs[target] = temp;
    renderPacks();
    autoSave();
  }

  window.switchPackLang = function (index, lang) {
    document.querySelectorAll(`#tabGroup_${index} .l-tab`).forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`pack_${index}_fr`).style.display = 'none';
    document.getElementById(`pack_${index}_en`).style.display = 'none';
    document.getElementById(`pack_${index}_ar`).style.display = 'none';
    document.getElementById(`pack_${index}_${lang}`).style.display = 'block';
  }

  window.updatePack = function (index, lang, key, value) {
    packs[index][lang][key] = value;
    autoSave();
  }

  function addPackAction() {
    packs.push({
      fr: { title: 'Nouveau / Prix', desc: '', features: '', stat: '' },
      en: { title: 'New / Price', desc: '', features: '', stat: '' },
      ar: { title: 'جديد / السعر', desc: '', features: '', stat: '' }
    });
    renderPacks();
    autoSave('Nouveau Plan ajouté et sauvegardé !');

    // Switch to packs tab if not active
    const packsBtn = document.querySelector('.nav-btn[data-target="packs"]');
    if (packsBtn) packsBtn.click();
  }

  document.getElementById('addPackBtn').addEventListener('click', addPackAction);
  document.getElementById('sideAddBtn').addEventListener('click', addPackAction);

  renderPacks();

  /* ── 3. GALLERY (OLD WORK) ── */
  const galleryContainer = document.getElementById('galleryContainer');

  function renderGallery() {
    galleryContainer.innerHTML = gallery.map((proj, i) => {
      // Backward compat: convert old single image to array
      if (!proj.images) proj.images = proj.image ? [proj.image] : [];

      const thumbs = proj.images.map((src, j) => `
        <div class="gal-thumb">
          <img src="${src}" alt="img ${j + 1}">
          <button class="gal-thumb-del" onclick="removeGalImg(${i}, ${j})">&times;</button>
        </div>
      `).join('');

      return `
      <div class="project-item">
        <div class="item-actions">
          <button class="btn btn-move" onclick="moveGal(${i}, -1)" ${i === 0 ? 'disabled' : ''}>&uarr;</button>
          <button class="btn btn-move" onclick="moveGal(${i}, 1)" ${i === gallery.length - 1 ? 'disabled' : ''}>&darr;</button>
          <button class="btn btn-delete remove-gal" data-i="${i}">Retirer</button>
        </div>
        <div style="margin-bottom:12px;">
          <label>Identifiant du projet (Nom court)</label>
          <input type="text" value="${esc(proj.title)}" onchange="updateGal(${i}, 'title', this.value)">
        </div>
        <div style="margin-bottom:12px;">
          <label>Catégorie (ex: Commerce, Restaurant)</label>
          <input type="text" value="${esc(proj.category)}" onchange="updateGal(${i}, 'category', this.value)">
        </div>
        <div style="margin-bottom:12px;">
          <label>Lien du site (optionnel)</label>
          <input type="text" value="${esc(proj.link)}" onchange="updateGal(${i}, 'link', this.value)" placeholder="https://example.com">
        </div>
        <div style="margin-bottom:12px;">
          <label>Images du projet (ajoutez autant que vous voulez)</label>
          <input type="file" onchange="uploadGalImgs(${i}, this)" accept="image/*" multiple>
          <div class="gal-thumbs-grid" id="galGrid_${i}">
            ${thumbs}
          </div>
          <small style="color:#94a3b8;">${proj.images.length} image(s) ajoutée(s)</small>
        </div>
      </div>
      `;
    }).join('');

    document.querySelectorAll('.remove-gal').forEach(b => b.addEventListener('click', (e) => {
      gallery.splice(Number(e.target.dataset.i), 1);
      renderGallery();
      autoSave('Projet retiré avec succès !');
    }));
  }

  window.moveGal = function (index, direction) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    const temp = gallery[index];
    gallery[index] = gallery[target];
    gallery[target] = temp;
    renderGallery();
    autoSave();
  }

  window.updateGal = function (index, key, value) {
    gallery[index][key] = value;
    autoSave();
  }

  window.removeGalImg = function (projIndex, imgIndex) {
    gallery[projIndex].images.splice(imgIndex, 1);
    renderGallery();
    autoSave('Image supprimée !');
  }

  window.uploadGalImgs = function (index, input) {
    const files = Array.from(input.files);
    if (!files.length) return;
    if (!gallery[index].images) gallery[index].images = [];

    let loaded = 0;
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        // Smart compression to avoid breaking localStorage
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const MAX_SIZE = 800;

          if (w > h && w > MAX_SIZE) {
            h *= MAX_SIZE / w;
            w = MAX_SIZE;
          } else if (h > MAX_SIZE) {
            w *= MAX_SIZE / h;
            h = MAX_SIZE;
          }

          canvas.width = Math.round(w);
          canvas.height = Math.round(h);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG with 80% quality (very lightweight)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          gallery[index].images.push(dataUrl);

          loaded++;
          if (loaded === files.length) {
            renderGallery();
            autoSave(`${loaded} image(s) compressée(s) et ajoutée(s) !`);
          }
        };
        img.src = ev.target.result;
      };
      r.readAsDataURL(f);
    });
  }

  function addGalleryAction() {
    gallery.push({ title: 'Nouveau projet', category: '', link: '', desc: '', image: '', images: [] });
    renderGallery();
    autoSave('Nouveau Projet ajouté et sauvegardé !');

    // Switch to gallery tab if not active
    const galBtn = document.querySelector('.nav-btn[data-target="gallery"]');
    if (galBtn) galBtn.click();

    // Scroll to the new item
    setTimeout(() => {
      const items = document.querySelectorAll('.project-item');
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  document.getElementById('addGalleryBtn').addEventListener('click', addGalleryAction);
  const sideGalBtn = document.getElementById('sideAddGalBtn');
  if (sideGalBtn) sideGalBtn.addEventListener('click', addGalleryAction);

  renderGallery();

  /* ── SAVE ALL ── */
  document.getElementById('saveAllBtn').addEventListener('click', () => {

    // We must ensure the 'features' are stored as an array of strings per language to match `script.js`
    const cleanedPacks = JSON.parse(JSON.stringify(packs));
    cleanedPacks.forEach(p => {
      if (typeof p.fr.features === 'string') p.fr.features = p.fr.features.split('\n').filter(Boolean);
      if (typeof p.en.features === 'string') p.en.features = p.en.features.split('\n').filter(Boolean);
      if (typeof p.ar.features === 'string') p.ar.features = p.ar.features.split('\n').filter(Boolean);
    });

    data.social = { whatsapp: val('waNum'), insta: val('igLink'), fb: val('fbLink') };
    data.admin = { user: val('adminUser'), pass: val('adminPass') };
    data.services = cleanedPacks;
    data.projects = gallery;

    setStorage(data);

    const s = document.getElementById('saveStatus');
    s.innerHTML = `✅ Sauvegardé avec succès à ${new Date().toLocaleTimeString()} !`;
    s.className = 'save-status ok';

    // Reset status after 3s
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
    } else {
      alert("Erreur de sauvegarde : l'image est trop lourde ! Retirez des images.");
    }
  }
}

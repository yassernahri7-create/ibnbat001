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
    const res = await fetch('/api/config');
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
            <div><label>إحصائية صغيرة (AR)</label><input type="text" value="${esc(pack.ar.stat)}" onchange="updatePack(${i}, 'ar', 'stat', this.value)"></div>
          </div>
          <div><label>وصف قصير (AR)</label><input type="text" value="${esc(pack.ar.desc)}" onchange="updatePack(${i}, 'ar', 'desc', this.value)"></div>
          <div><label>الميزات المضمنة (واحدة في كل سطر)</label><textarea rows="3" onchange="updatePack(${i}, 'ar', 'features', this.value)">${esc(renderFeatures(pack.ar))}</textarea></div>
        </div>
      </div>
      `;
    }).join('');

    packsContainer.querySelectorAll('.remove-pack').forEach(btn => {
      btn.addEventListener('click', () => {
        packs.splice(btn.dataset.i, 1);
        renderPacks();
        autoSave('Plan supprimé avec succès !');
      });
    });
  }

  window.movePack = function (i, dir) {
    const target = i + dir;
    if (target < 0 || target >= packs.length) return;
    [packs[i], packs[target]] = [packs[target], packs[i]];
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
    packs[i][lang][key] = val;
    autoSave();
  };

  function addPackAction() {
    packs.push({
      fr: { title: 'Nouveau Plan', desc: '', features: '', stat: '' },
      en: { title: 'New Plan', desc: '', features: '', stat: '' },
      ar: { title: 'خطة جديدة', desc: '', features: '', stat: '' }
    });
    renderPacks();
    autoSave('Nouveau Plan ajouté et sauvegardé !');

    // Switch to packs tab if not active
    const packsBtn = document.querySelector('.nav-btn[data-target="packs"]');
    if (packsBtn) packsBtn.click();

    setTimeout(() => {
      const items = document.querySelectorAll('.service-item');
      items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  document.getElementById('addPackBtn').addEventListener('click', addPackAction);
  document.getElementById('sideAddBtn').addEventListener('click', addPackAction);

  renderPacks();

  /* ── 3. GALLERY ── */
  const galleryContainer = document.getElementById('galleryContainer');

  function renderGallery() {
    galleryContainer.innerHTML = gallery.map((item, i) => `
      <div class="project-item card">
        <div class="item-actions">
           <button class="btn btn-delete remove-gal" data-i="${i}">Supprimer</button>
        </div>
        <div class="grid-2">
           <div><label>Titre du Projet</label><input type="text" value="${esc(item.title)}" onchange="gallery[${i}].title=this.value; autoSave()"></div>
           <div><label>Catégorie</label><input type="text" value="${esc(item.category)}" onchange="gallery[${i}].category=this.value; autoSave()"></div>
        </div>
        <div><label>Lien du projet (optionnel)</label><input type="text" value="${esc(item.link)}" onchange="gallery[${i}].link=this.value; autoSave()"></div>
        
        <div class="upload-area">
          <label>Images du projet (Choisir depuis l'ordinateur)</label>
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

        <div><label>Ou URLs (une par ligne)</label>
          <textarea rows="3" onchange="gallery[${i}].images=this.value.split('\\n').filter(Boolean); autoSave()">${(item.images || []).join('\n')}</textarea>
        </div>
      </div>
    `).join('');

    galleryContainer.querySelectorAll('.remove-gal').forEach(btn => {
      btn.addEventListener('click', () => {
        gallery.splice(btn.dataset.i, 1);
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
          if (!gallery[projIdx].images) gallery[projIdx].images = [];
          gallery[projIdx].images.push(url);
        }
      } catch (e) {
        console.error('Upload failed', e);
      }
    }

    renderGallery();
    autoSave('Images ajoutées avec succès !');
  };

  window.removeGalImg = function (projIdx, imgIdx) {
    gallery[projIdx].images.splice(imgIdx, 1);
    renderGallery();
    autoSave('Image retirée !');
  }

  function addGalleryAction() {
    gallery.push({ title: 'Nouveau Projet', category: 'Web', link: '', images: [] });
    renderGallery();
    autoSave('Nouveau Projet ajouté !');

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
  document.getElementById('saveAllBtn').addEventListener('click', async () => {

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

    // Local Backup
    setStorage(data);

    // Server Persistence
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Sauvegardé sur le serveur !');
      }
    } catch (e) {
      console.error('Server save failed', e);
      showToast('Erreur serveur (sauvegardé localement)');
    }

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

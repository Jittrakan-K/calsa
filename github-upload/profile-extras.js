/* CALSA — profile photo editor + hide-amounts toggle */
(function () {
  /* ---------------- Hide amounts (eye toggle) ---------------- */
  const HIDE_KEY = 'calsa_hide_amounts';
  function applyHidden(on) {
    document.documentElement.classList.toggle('amounts-hidden', on);
    const b = document.getElementById('btnToggleAmounts');
    if (b) {
      b.setAttribute('aria-pressed', String(on));
      const t = on ? 'Show Amounts' : 'Hide Amounts';
      b.title = t; b.setAttribute('aria-label', t);
    }
  }
  window.toggleAmountsHidden = function () {
    const on = !document.documentElement.classList.contains('amounts-hidden');
    try { localStorage.setItem(HIDE_KEY, on ? '1' : '0'); } catch (e) {}
    applyHidden(on);
  };
  let initial = false;
  try { initial = localStorage.getItem(HIDE_KEY) === '1'; } catch (e) {}
  applyHidden(initial);

  /* ---------------- Profile photo ---------------- */
  const LS_PREFIX = 'calsa_photo_';
  function me() { return (typeof getCurrentUser === 'function' ? getCurrentUser() : null) || window.currentUser || null; }
  function photoOf(user) {
    if (!user) return '';
    try {
      const list = typeof getAllSystemUsers === 'function' ? getAllSystemUsers() : [];
      const rec = list.find((u) => u.id === user.id);
      if (rec && rec.photo) return rec.photo;
    } catch (e) {}
    if (user.photo) return user.photo;
    try { return localStorage.getItem(LS_PREFIX + user.id) || ''; } catch (e) { return ''; }
  }
  function setImg(el, src, fallbackText) {
    if (!el) return;
    if (src) {
      el.classList.add('has-photo');
      el.innerHTML = '<img alt="" src="' + src + '">';
    } else {
      el.classList.remove('has-photo');
      if (el.querySelector('img')) el.textContent = fallbackText;
    }
  }
  function applyPhotos() {
    const u = me();
    const src = photoOf(u);
    const initial = ((u && u.name) || 'U').charAt(0).toUpperCase();
    setImg(document.getElementById('userModalAvatar'), src, initial);
    setImg(document.getElementById('accAvatarLarge'), src, initial);
    const trig = document.querySelector('#userProfileTriggerBtn .user-role-badge-icon');
    if (trig) {
      if (src) {
        if (!trig.dataset.icon) trig.dataset.icon = trig.innerHTML;
        trig.classList.add('has-photo');
        trig.innerHTML = '<img alt="" src="' + src + '">';
      } else if (trig.dataset.icon) {
        trig.classList.remove('has-photo');
        trig.innerHTML = trig.dataset.icon;
        delete trig.dataset.icon;
      }
    }
  }
  window.applyProfilePhotos = applyPhotos;

  // Re-apply after the app re-renders the navbar / opens profile screens
  ['openUserProfileModal', 'updateNavbarAuthUI', 'openAccountModal', 'notifyAuthState'].forEach((name) => {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      const r = orig.apply(this, arguments);
      try { applyPhotos(); } catch (e) {}
      return r;
    };
  });

  function savePhoto(dataUrl) {
    const u = me();
    if (!u) return false;
    try {
      if (dataUrl) localStorage.setItem(LS_PREFIX + u.id, dataUrl);
      else localStorage.removeItem(LS_PREFIX + u.id);
    } catch (e) {}
    if (typeof updateSystemUser === 'function') {
      const res = updateSystemUser(u.id, { photo: dataUrl || '' });
      if (res && res.success === false) console.warn(res.error);
    }
    u.photo = dataUrl || '';
    applyPhotos();
    return true;
  }

  /* ---- Picker + crop sheet ---- */
  let fileInput = null, sheet = null, img = null, zoom = 1, minZoom = 1, ox = 0, oy = 0;
  const VIEW = 260, OUT = 192;

  window.openProfilePhotoPicker = function () {
    if (!me()) { if (typeof openAuthModal === 'function') openAuthModal(); return; }
    openSheet(null);
  };

  function pickFile() {
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', () => {
        const f = fileInput.files && fileInput.files[0];
        fileInput.value = '';
        if (!f) return;
        if (!/^image\//.test(f.type)) { alert('Please choose an image file.'); return; }
        const r = new FileReader();
        r.onload = () => loadImage(r.result);
        r.readAsDataURL(f);
      });
      document.body.appendChild(fileInput);
    }
    fileInput.click();
  }

  function loadImage(src) {
    const im = new Image();
    im.onload = () => {
      img = im;
      minZoom = Math.max(VIEW / im.width, VIEW / im.height);
      zoom = minZoom; ox = 0; oy = 0;
      const sl = sheet.querySelector('.pp-zoom');
      sl.min = String(minZoom); sl.max = String(minZoom * 4); sl.step = String(minZoom / 100); sl.value = String(zoom);
      sheet.classList.add('pp-has-image');
      draw();
    };
    im.src = src;
  }

  function clamp() {
    const w = img.width * zoom, h = img.height * zoom;
    const mx = Math.max(0, (w - VIEW) / 2), my = Math.max(0, (h - VIEW) / 2);
    ox = Math.min(mx, Math.max(-mx, ox));
    oy = Math.min(my, Math.max(-my, oy));
  }

  function draw() {
    const c = sheet.querySelector('.pp-canvas');
    const dpr = window.devicePixelRatio || 1;
    c.width = VIEW * dpr; c.height = VIEW * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#EEF0F9'; ctx.fillRect(0, 0, VIEW, VIEW);
    if (!img) return;
    clamp();
    const w = img.width * zoom, h = img.height * zoom;
    ctx.drawImage(img, (VIEW - w) / 2 + ox, (VIEW - h) / 2 + oy, w, h);
  }

  function exportPhoto() {
    const c = document.createElement('canvas');
    c.width = OUT; c.height = OUT;
    const ctx = c.getContext('2d');
    const s = OUT / VIEW, w = img.width * zoom * s, h = img.height * zoom * s;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, OUT, OUT);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (OUT - w) / 2 + ox * s, (OUT - h) / 2 + oy * s, w, h);
    return c.toDataURL('image/jpeg', 0.85);
  }

  function openSheet() {
    if (!sheet) build();
    img = null;
    sheet.classList.remove('pp-has-image');
    const cur = photoOf(me());
    sheet.querySelector('.pp-remove').style.display = cur ? '' : 'none';
    const prev = sheet.querySelector('.pp-current');
    prev.innerHTML = cur ? '<img alt="" src="' + cur + '">' : '<span>' + ((me().name || 'U').charAt(0).toUpperCase()) + '</span>';
    draw();
    sheet.style.display = 'grid';
    requestAnimationFrame(() => sheet.classList.add('is-open'));
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove('is-open');
    setTimeout(() => { sheet.style.display = 'none'; }, 200);
  }

  function build() {
    sheet = document.createElement('div');
    sheet.className = 'pp-backdrop';
    sheet.innerHTML = `
      <div class="pp-dialog" role="dialog" aria-modal="true" aria-label="Profile photo">
        <div class="pp-head">
          <div>
            <div class="pp-title">Profile Photo</div>
            <div class="pp-sub">Shown on your profile and in the top bar</div>
          </div>
          <button type="button" class="modal-close pp-x" aria-label="Close"><svg class="ic-x" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
        </div>
        <div class="pp-stage">
          <div class="pp-empty">
            <div class="pp-current"></div>
            <button type="button" class="pp-drop">
              <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
              <span><b>Choose a Photo</b><small>JPG, PNG or HEIC from your device</small></span>
            </button>
          </div>
          <div class="pp-crop">
            <div class="pp-frame"><canvas class="pp-canvas" width="${VIEW}" height="${VIEW}"></canvas><div class="pp-ring"></div></div>
            <div class="pp-zoom-row">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M8.5 11h5M20 20l-4.2-4.2"/></svg>
              <input type="range" class="pp-zoom" aria-label="Zoom">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M8.5 11h5M11 8.5v5M20 20l-4.2-4.2"/></svg>
            </div>
            <div class="pp-hint">Drag to reposition · Slide to zoom</div>
          </div>
        </div>
        <div class="pp-foot">
          <button type="button" class="pp-btn pp-remove">Remove Photo</button>
          <span class="pp-spacer"></span>
          <button type="button" class="pp-btn pp-change">Choose Another</button>
          <button type="button" class="pp-btn pp-primary pp-save">Save Photo</button>
        </div>
      </div>`;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
    sheet.querySelector('.pp-x').onclick = closeSheet;
    sheet.querySelector('.pp-drop').onclick = pickFile;
    sheet.querySelector('.pp-change').onclick = pickFile;
    sheet.querySelector('.pp-remove').onclick = () => {
      if (!confirm('Remove your profile photo?')) return;
      savePhoto(''); closeSheet();
    };
    sheet.querySelector('.pp-save').onclick = () => {
      if (!img) { pickFile(); return; }
      savePhoto(exportPhoto()); closeSheet();
    };
    sheet.querySelector('.pp-zoom').addEventListener('input', (e) => { zoom = parseFloat(e.target.value); draw(); });
    const frame = sheet.querySelector('.pp-frame');
    let drag = null;
    frame.addEventListener('pointerdown', (e) => { if (!img) return; drag = { x: e.clientX, y: e.clientY, ox, oy }; frame.setPointerCapture(e.pointerId); });
    frame.addEventListener('pointermove', (e) => { if (!drag) return; ox = drag.ox + e.clientX - drag.x; oy = drag.oy + e.clientY - drag.y; draw(); });
    frame.addEventListener('pointerup', () => { drag = null; });
    frame.addEventListener('pointercancel', () => { drag = null; });
    frame.addEventListener('wheel', (e) => {
      if (!img) return;
      e.preventDefault();
      zoom = Math.min(minZoom * 4, Math.max(minZoom, zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
      sheet.querySelector('.pp-zoom').value = String(zoom);
      draw();
    }, { passive: false });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyPhotos);
  else applyPhotos();
  setTimeout(applyPhotos, 1500);
})();

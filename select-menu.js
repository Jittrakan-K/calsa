/* CALSA — custom dropdown menus
 * Replaces the browser's native <select> popup with a styled menu.
 * The real <select> stays in the DOM, so app.js keeps reading/writing
 * .value and its onchange handlers fire exactly as before.
 */
(function () {
  const SKIP = new Set(['simDeviceSelect', 'simScaleSelect']);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const ICONS = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>'
  };

  let menu = null, backdrop = null, current = null, items = [], activeIdx = -1;

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const eligible = (el) => el && el.tagName === 'SELECT' && !el.multiple && !(el.size > 1) && !SKIP.has(el.id) && !el.disabled;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function anchorOf(sel) { return sel.closest('.pill-select') || sel; }

  function titleOf(sel) {
    const t = sel.getAttribute('title') || (anchorOf(sel).getAttribute && anchorOf(sel).getAttribute('title'));
    if (t) return t;
    const id = sel.id && document.querySelector(`label[for="${sel.id}"]`);
    if (id) return id.textContent.trim();
    const grp = sel.closest('.form-group, .mb-3, .field');
    const lb = grp && grp.querySelector('label, .form-label');
    return lb ? lb.textContent.trim() : '';
  }

  // "October 2026" style option lists → month grid
  function monthGrid(opts) {
    if (opts.length < 6) return null;
    const parsed = [];
    for (const o of opts) {
      const m = o.text.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
      if (!m || MONTHS.indexOf(m[1]) < 0) return null;
      parsed.push({ o, mi: MONTHS.indexOf(m[1]), year: m[2] });
    }
    return parsed;
  }

  function build(sel) {
    const opts = Array.from(sel.options);
    const title = titleOf(sel);
    let html = '';
    if (title) html += `<div class="sm-head"><span>${esc(title)}</span>${isMobile() ? '<button type="button" class="sm-close" aria-label="Close">&times;</button>' : ''}</div>`;

    const grid = monthGrid(opts);
    if (grid) {
      const years = [...new Set(grid.map((g) => g.year))];
      years.forEach((y) => {
        if (years.length > 1) html += `<div class="sm-group">${y}</div>`;
        else html += `<div class="sm-group">Payroll periods · ${y}</div>`;
        html += '<div class="sm-grid">';
        grid.filter((g) => g.year === y).forEach((g) => {
          const idx = opts.indexOf(g.o);
          const on = idx === sel.selectedIndex;
          html += `<button type="button" class="sm-cell${on ? ' is-selected' : ''}" data-idx="${idx}" role="option" aria-selected="${on}">${MONTHS[g.mi].slice(0, 3)}</button>`;
        });
        html += '</div>';
      });
    } else {
      html += '<div class="sm-list" role="listbox">';
      opts.forEach((o, idx) => {
        const text = o.text.trim();
        if (o.disabled && (/^[─—\-_\s]+$/.test(text) || text === '')) { html += '<div class="sm-divider"></div>'; return; }
        if (o.hidden) return;
        const isAction = /^__/.test(o.value);
        const on = idx === sel.selectedIndex && !isAction;
        if (isAction) {
          const icon = /MANAGE/i.test(o.value) ? ICONS.gear : ICONS.plus;
          const label = text.replace(/^\+\s*/, '');
          html += `<button type="button" class="sm-item sm-action" data-idx="${idx}"><span class="sm-ico">${icon}</span><span class="sm-text">${esc(label)}</span></button>`;
        } else {
          html += `<button type="button" class="sm-item${on ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}" data-idx="${idx}" role="option" aria-selected="${on}"${o.disabled ? ' disabled' : ''}><span class="sm-text">${esc(text || '—')}</span><span class="sm-check">${ICONS.check}</span></button>`;
        }
      });
      html += '</div>';
    }
    return { html, grid: !!grid };
  }

  function position(sel) {
    if (isMobile()) { menu.style.cssText = ''; return; }
    const r = anchorOf(sel).getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.max(r.width, menu.classList.contains('sm-has-grid') ? 300 : 240);
    menu.style.width = Math.min(w, vw - 24) + 'px';
    let left = Math.min(Math.max(12, r.left), vw - Math.min(w, vw - 24) - 12);
    menu.style.left = left + 'px';
    const below = vh - r.bottom - 12, above = r.top - 12;
    const h = menu.scrollHeight;
    if (h > below && above > below) {
      menu.style.maxHeight = Math.min(420, above - 8) + 'px';
      menu.style.top = 'auto';
      menu.style.bottom = (vh - r.top + 8) + 'px';
      menu.dataset.side = 'top';
    } else {
      menu.style.maxHeight = Math.min(420, below - 8) + 'px';
      menu.style.top = (r.bottom + 8) + 'px';
      menu.style.bottom = 'auto';
      menu.dataset.side = 'bottom';
    }
  }

  function open(sel) {
    if (current === sel) { close(); return; }
    close(true);
    current = sel;
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'sm-menu';
      menu.addEventListener('click', onMenuClick);
      menu.addEventListener('mousemove', (e) => {
        const b = e.target.closest('[data-idx]');
        if (b) setActive(items.indexOf(b));
      });
      backdrop = document.createElement('div');
      backdrop.className = 'sm-backdrop';
      backdrop.addEventListener('click', () => close());
      document.body.append(backdrop, menu);
    }
    const { html, grid } = build(sel);
    menu.innerHTML = html;
    menu.classList.toggle('sm-has-grid', grid);
    menu.classList.toggle('sm-sheet', isMobile());
    items = Array.from(menu.querySelectorAll('[data-idx]:not([disabled])'));
    activeIdx = items.findIndex((b) => b.classList.contains('is-selected'));
    anchorOf(sel).classList.add('sm-open');
    position(sel);
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
      backdrop.classList.toggle('is-open', isMobile());
      const s = menu.querySelector('.is-selected');
      if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
      if (activeIdx >= 0) setActive(activeIdx, true);
    });
  }

  function close(silent) {
    if (!menu || !current) return;
    anchorOf(current).classList.remove('sm-open');
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    const s = current; current = null; items = []; activeIdx = -1;
    if (!silent) try { s.focus({ preventScroll: true }); } catch (e) {}
  }

  function setActive(i, keepScroll) {
    items.forEach((b) => b.classList.remove('is-active'));
    if (i < 0 || i >= items.length) return;
    activeIdx = i;
    items[i].classList.add('is-active');
    if (!keepScroll) items[i].scrollIntoView({ block: 'nearest' });
  }

  function choose(idx) {
    const sel = current;
    if (!sel) return;
    close();
    if (sel.selectedIndex === idx && !/^__/.test(sel.options[idx].value)) return;
    sel.selectedIndex = idx;
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function onMenuClick(e) {
    if (e.target.closest('.sm-close')) { close(); return; }
    const b = e.target.closest('[data-idx]');
    if (b && !b.disabled) choose(+b.dataset.idx);
  }

  // Open on pointer press instead of the native popup
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    let sel = e.target.closest('select');
    if (!sel) {
      const pill = e.target.closest('.pill-select');
      sel = pill && pill.querySelector('select');
    }
    if (!eligible(sel)) return;
    e.preventDefault();
    sel.focus({ preventScroll: true });
    open(sel);
  }, true);

  // Touch devices: stop the OS picker and use the sheet
  document.addEventListener('touchend', (e) => {
    const sel = e.target.closest('select') || (e.target.closest('.pill-select') || {}).querySelector?.('select');
    if (!eligible(sel)) return;
    e.preventDefault();
    open(sel);
  }, { capture: true, passive: false });

  document.addEventListener('keydown', (e) => {
    if (current) {
      const cols = menu.classList.contains('sm-has-grid') ? 3 : 1;
      if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(items.length - 1, activeIdx + cols)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, activeIdx - cols)); }
      else if (e.key === 'ArrowRight' && cols > 1) { e.preventDefault(); setActive(Math.min(items.length - 1, activeIdx + 1)); }
      else if (e.key === 'ArrowLeft' && cols > 1) { e.preventDefault(); setActive(Math.max(0, activeIdx - 1)); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (items[activeIdx]) choose(+items[activeIdx].dataset.idx); }
      return;
    }
    const sel = document.activeElement;
    if (eligible(sel) && (e.key === 'Enter' || e.key === ' ' || (e.altKey && e.key === 'ArrowDown'))) {
      e.preventDefault();
      open(sel);
    }
  }, true);

  document.addEventListener('mousedown', (e) => {
    if (current && menu && !menu.contains(e.target) && !anchorOf(current).contains(e.target)) close(true);
  });
  window.addEventListener('resize', () => { if (current) close(true); });
  window.addEventListener('scroll', (e) => {
    if (current && !isMobile() && !(menu && menu.contains(e.target))) close(true);
  }, true);
})();

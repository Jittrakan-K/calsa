/* CALSA — Title Case for all interface text
 * "Payroll overview" → "Payroll Overview", "deductions and net pay" → "Deductions and Net Pay".
 * Runs on the live page (including text app.js renders later), so no strings in
 * app.js need to change. Inputs, textareas and user-typed values are left alone.
 */
(function () {
  const MINOR = new Set(['a','an','the','and','or','but','nor','for','of','in','on','at','to','by','per','vs','via','with','from','as','into','than','if','is']);
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','CODE','PRE','NOSCRIPT','SVG']);
  const BREAK = /[:.!?·—–(]$/;

  function tc(text, startFirst) {
    let first = startFirst !== false;
    text = text.replace(/\bOT\b/g, 'Overtime');
    return text.replace(/(\S+)(\s*)/g, (m, word, sp) => {
      let out = word;
      const core = word.replace(/^[^A-Za-z]+/, '');
      const lead = word.slice(0, word.length - core.length);
      const bare = core.replace(/[^A-Za-z']+$/, '').toLowerCase();
      const isWord = /^[a-z]/.test(core) && !/[0-9@\/]/.test(core) && !/[A-Z]/.test(core) && !/\.[a-z]/.test(core) && !/[a-z]-[a-z]/i.test(core);
      if (isWord && core.length > 1 && !(MINOR.has(bare) && !first && !/[(\[]$/.test(lead))) {
        out = lead + core.charAt(0).toUpperCase() + core.slice(1);
      }
      first = BREAK.test(word);
      return out + sp;
    });
  }

  function skip(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (SKIP_TAGS.has(n.tagName) || n.isContentEditable || (n.classList && n.classList.contains('no-tc'))) return true;
    }
    return false;
  }

  const INLINE = new Set(['SPAN','STRONG','B','EM','I','A','CODE','KBD','SMALL','LABEL','U','MARK','SUB','SUP']);
  // Is this text node the start of its line/block? (so "And" after a <code> stays "and")
  function startsSentence(node) {
    let n = node;
    for (let depth = 0; n && depth < 4; depth++) {
      let p = n.previousSibling;
      while (p) {
        const t = (p.textContent || '').trim();
        if (p.nodeName === 'BR') return true;
        if (t) return /[:.!?·—–]$/.test(t);
        p = p.previousSibling;
      }
      n = n.parentNode;
      if (!n || !INLINE.has(n.nodeName)) return true;
    }
    return true;
  }

  function fixNode(node) {
    const v = node.nodeValue;
    if (!v || !/[a-z]|\bOT\b/.test(v)) return;
    if (skip(node.parentElement)) return;
    const n = tc(v, startsSentence(node));
    if (n !== v) node.nodeValue = n;
  }

  function fixAttrs(el) {
    if (el.nodeType !== 1) return;
    ['placeholder', 'title', 'aria-label'].forEach((a) => {
      const v = el.getAttribute && el.getAttribute(a);
      if (a === 'placeholder' && el.tagName === 'TEXTAREA') return;
      if (v && /[a-z]|\bOT\b/.test(v) && !/^e\.g\./i.test(v) && !/@/.test(v)) {
        const n = tc(v);
        if (n !== v) el.setAttribute(a, n);
      }
    });
  }

  function walk(root) {
    if (root.nodeType === 3) { fixNode(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    fixAttrs(root);
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(fixAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) fixNode(t);
  }

  let pending = new Set(), scheduled = false;
  function flush() {
    scheduled = false;
    const list = Array.from(pending); pending.clear();
    obs.disconnect();
    list.forEach((n) => { if (n.isConnected) walk(n); });
    obs.observe(document.body, CFG);
  }
  const CFG = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title'] };
  const obs = new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.type === 'childList') m.addedNodes.forEach((n) => pending.add(n));
      else pending.add(m.target);
    });
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
  });

  function start() {
    walk(document.body);
    document.title = tc(document.title);
    obs.observe(document.body, CFG);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.toTitleCase = tc;
})();

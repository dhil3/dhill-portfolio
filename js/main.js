/* Dhill portfolio: theme, navigation, service shortcuts and enquiry flow. */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initEnquiry();
  initBackToTop();
});

const SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
const MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function initTheme() {
  const btn = document.getElementById('themeToggleBtn');
  const root = document.documentElement;
  const paint = (theme) => {
    root.setAttribute('data-theme', theme);
    btn.innerHTML = theme === 'dark' ? SUN : MOON;
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };
  paint(root.getAttribute('data-theme') || 'dark');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    paint(next);
    try { localStorage.setItem('dhill_theme', next); } catch (e) { /* storage unavailable */ }
  });
}

function initNavigation() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) { setOpen(false); menuBtn.focus(); }
  });

  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  const spy = () => {
    const y = window.scrollY + 140;
    let current = '';
    sections.forEach((s) => { if (y >= s.offsetTop) current = s.id; });
    links.forEach((l) => {
      const on = l.getAttribute('href') === `#${current}`;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();
}

function initEnquiry() {
  const cfg = window.SITE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const form = $('enquiryForm');
  const steps = [...form.querySelectorAll('.fstep')];
  const dots = [...form.querySelectorAll('.progress li')];
  const needs = [...form.querySelectorAll('input[name="need"]')];
  const contact = $('clientContact');
  let step = 1;

  renderChannels(cfg);

  const pref = () => form.querySelector('input[name="pref"]:checked').value;

  function setError(input, errEl, message) {
    errEl.textContent = message;
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function validate(n) {
    if (n === 1) return setError($('clientBusinessName'), $('err-clientBusinessName'), $('clientBusinessName').value.trim() ? '' : 'Please enter your company name.');
    if (n === 2) return setError(null, $('err-need'), needs.some((c) => c.checked) ? '' : 'Please choose at least one option.');
    if (n === 3) return setError($('clientGoal'), $('err-clientGoal'), $('clientGoal').value.trim() ? '' : 'Please tell me briefly what you would like to improve.');
    if (n === 4) {
      const nameOk = setError($('clientName'), $('err-clientName'), $('clientName').value.trim() ? '' : 'Please enter your name.');
      const v = contact.value.trim();
      const msg = pref() === 'Email'
        ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address, like name@business.com.')
        : (v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter your WhatsApp number with country code.');
      return setError(contact, $('err-clientContact'), msg) && nameOk;
    }
    return true;
  }

  function show(n, moveFocus = true) {
    step = n;
    steps.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    dots.forEach((d, i) => d.classList.toggle('on', i < n));
    $('stepCount').textContent = n <= 4 ? `Step ${n} of 4` : 'Review and send';
    $('prevBtn').hidden = n === 1;
    $('nextBtn').hidden = n === 5;
    $('nextBtn').textContent = n === 4 ? 'Review Brief' : 'Continue';
    if (n === 5) {
      $('briefPreview').textContent = brief();
      $('sendStatus').textContent = '';
      $('emailInquiryBtn').hidden = !cfg.email;
      $('whatsappInquiryBtn').hidden = !cfg.whatsapp;
    }
    if (moveFocus) {
      const target = steps[n - 1].querySelector('input, textarea, h3');
      if (target) { if (target.tagName === 'H3') target.tabIndex = -1; target.focus({ preventScroll: true }); }
    }
  }

  function brief() {
    const selected = needs.filter((c) => c.checked).map((c) => `- ${c.value}`).join('\n');
    return [
      'Digital marketing enquiry',
      '',
      `Company: ${$('clientBusinessName').value.trim()}`,
      `Website / Maps: ${$('clientWebsite').value.trim() || 'Not provided'}`,
      '',
      'Looking for help with:',
      selected,
      '',
      'Goal:',
      $('clientGoal').value.trim(),
      '',
      `Name: ${$('clientName').value.trim()}`,
      `Preferred contact: ${pref()} (${contact.value.trim()})`
    ].join('\n');
  }

  function renderPicked() {
    const selected = needs.filter((c) => c.checked);
    $('selectedCountBadge').textContent = selected.length;
    const list = $('pickedList');
    list.textContent = '';
    selected.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.setAttribute('aria-label', `Remove ${c.value}`);
      b.textContent = `${c.value} ×`;
      b.addEventListener('click', () => { c.checked = false; renderPicked(); });
      list.appendChild(b);
    });
    if (selected.length) $('err-need').textContent = '';
  }

  needs.forEach((c) => c.addEventListener('change', renderPicked));

  form.querySelectorAll('input[name="pref"]').forEach((r) => r.addEventListener('change', () => {
    const wa = pref() === 'WhatsApp';
    $('contactLabel').textContent = wa ? 'Your WhatsApp number' : 'Your email address';
    contact.type = wa ? 'tel' : 'email';
    contact.autocomplete = wa ? 'tel' : 'email';
    setError(contact, $('err-clientContact'), '');
  }));

  $('nextBtn').addEventListener('click', () => { if (validate(step)) show(step + 1); else form.querySelector('[aria-invalid="true"]')?.focus(); });
  $('prevBtn').addEventListener('click', () => show(step - 1));
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); $('nextBtn').click(); }
  });

  const status = (msg) => { $('sendStatus').textContent = msg; };

  $('copyBriefBtn').addEventListener('click', async () => {
    const ok = await copyText(brief());
    status(ok ? 'Brief copied. You can paste it into any message.' : 'Could not copy automatically. Please select the brief above and copy it.');
  });

  $('emailInquiryBtn').addEventListener('click', () => {
    const subject = `Digital marketing enquiry: ${$('clientBusinessName').value.trim()}`;
    status(`Opening your email app. If nothing opens, copy the brief and send it to ${cfg.email}.`);
    window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief())}`;
  });

  $('whatsappInquiryBtn').addEventListener('click', () => {
    status('Opening WhatsApp. If nothing opens, copy the brief and send it manually.');
    window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(brief())}`, '_blank', 'noopener');
  });

  // Service cards jump to the form with their need already ticked.
  document.querySelectorAll('.discuss').forEach((a) => a.addEventListener('click', () => {
    const match = needs.find((c) => c.value === a.dataset.need);
    if (match) { match.checked = true; renderPicked(); }
  }));

  renderPicked();
  show(1, false);
}

function renderChannels(cfg) {
  const ul = document.getElementById('contactChannels');
  const rows = [];
  if (cfg.email) rows.push(['Email', `mailto:${cfg.email}`, cfg.email]);
  if (cfg.whatsapp) rows.push(['WhatsApp', `https://wa.me/${cfg.whatsapp}`, 'Message on WhatsApp']);
  if (cfg.linkedin) rows.push(['LinkedIn', cfg.linkedin, 'Connect on LinkedIn']);
  rows.forEach(([label, href, text]) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = label;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
    li.append(span, a);
    ul.appendChild(li);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600), { passive: true });
  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}

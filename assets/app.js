/* Merca Stay concept site. No cookies, no tracking, nothing is sent: the forms prepare a message
   that the visitor sends from their own email app or WhatsApp. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EMAIL = 'info@merca-stay-apartments.com';
  const WA = 'https://wa.me/34607987821';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  // a real calendar date only: 2027-02-31 and five-digit years give null
  const parseISO = s => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const longDate = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const shortDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  // read the clock each time, so a tab left open past midnight moves on with the day
  const todayISO = () => iso(new Date());
  const maxISO = () => iso(addDays(new Date(), 730));

  /* menu */
  const tog = $('.nav-toggle');
  const nav = $('#site-nav');
  if (tog && nav) {
    const isOpen = () => tog.getAttribute('aria-expanded') === 'true';
    const set = open => {
      tog.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    };
    tog.addEventListener('click', () => set(!isOpen()));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen()) {
        const inside = nav.contains(document.activeElement) || document.activeElement === tog;
        set(false);
        if (inside) tog.focus();
      }
    });
    // Tab past the last link closes the menu, so the focused element is never hidden under it.
    // Safari's Tab skips links, so focus can also leave straight from the button.
    const away = e => {
      const to = e.relatedTarget;
      if (isOpen() && to && !nav.contains(to) && to !== tog) set(false);
    };
    nav.addEventListener('focusout', away);
    tog.addEventListener('focusout', away);
    document.addEventListener('click', e => {
      if (isOpen() && !nav.contains(e.target) && !tog.contains(e.target)) set(false);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  }

  /* form checks, shared by the booking page, the date rules and the compose forms */
  const describe = (ctl, id, on) => {
    const ids = (ctl.getAttribute('aria-describedby') || '').split(/\s+/).filter(x => x && x !== id);
    if (on) ids.push(id);
    if (ids.length) ctl.setAttribute('aria-describedby', ids.join(' '));
    else ctl.removeAttribute('aria-describedby');
  };
  const setError = (ctl, msg) => {
    const id = `err-${ctl.id}`;
    let p = document.getElementById(id);
    if (msg) {
      if (!p) {
        p = document.createElement('p');
        p.className = 'err';
        p.id = id;
        ctl.insertAdjacentElement('afterend', p);
      }
      p.textContent = msg;
      ctl.setAttribute('aria-invalid', 'true');
    } else {
      if (p) p.remove();
      ctl.removeAttribute('aria-invalid');
    }
    describe(ctl, id, Boolean(msg));
  };
  // the chosen apartment's guest limit, from data-max on its option
  const guestCap = f => {
    const sel = f && f.elements.flat;
    const o = sel && sel.tagName === 'SELECT' ? sel.options[sel.selectedIndex] : null;
    const max = o ? Number(o.dataset.max) : 0;
    return max ? { max, name: o.text } : null;
  };
  const check = ctl => {
    const v = ctl.validity;
    const texty = ctl.tagName === 'TEXTAREA' || /^(text|email|tel)$/.test(ctl.type);
    let msg = '';
    // a half-typed date is both empty and bad input: ask for the rest of it
    if (v.badInput) msg = 'Please enter a full date.';
    else if (v.valueMissing) msg = ctl.tagName === 'SELECT' ? 'Please choose one.' : ctl.type === 'date' ? 'Please choose a date.' : 'Please fill this in.';
    else if (ctl.required && texty && !ctl.value.trim()) msg = 'Please fill this in.';
    else if (v.typeMismatch && ctl.type === 'email') msg = 'Please enter an email address, like name@example.com.';
    else if (v.rangeUnderflow) msg = ctl.name === 'out' && ctl.form.elements.in && ctl.form.elements.in.value ? 'Check-out must be after check-in.' : 'Please choose a date from today onwards.';
    else if (v.rangeOverflow) msg = 'Please choose a date within the next two years.';
    else if (ctl.type === 'date' && ctl.value && !parseISO(ctl.value)) msg = 'Please enter a full date.';
    else if (ctl.name === 'guests') {
      const cap = guestCap(ctl.form);
      if (cap && Number(ctl.value) > cap.max) msg = `${cap.name} sleeps up to ${cap.max}. Choose fewer guests or another apartment.`;
    }
    setError(ctl, msg);
    return !msg;
  };

  /* the booking page picks up the dates sent by the booking bar or an apartment page */
  const bookForm = $('form[data-kind="booking"]');
  if (bookForm) {
    const q = new URLSearchParams(location.search);
    const flat = $('#f-flat', bookForm);
    const want = q.get('flat');
    if (flat && want && [...flat.options].some(o => o.value === want)) flat.value = want;
    for (const [key, id] of [['in', '#f-in'], ['out', '#f-out']]) {
      const v = q.get(key);
      if (v && parseISO(v) && v >= todayISO() && v <= maxISO()) $(id, bookForm).value = v;
    }
    const guests = $('#f-guests', bookForm);
    const g = q.get('guests');
    if (guests && g && [...guests.options].some(o => o.value === g)) guests.value = g;
    const cap = guestCap(bookForm);
    if (guests && cap && Number(guests.value) > cap.max) check(guests);
  }

  /* dates: nothing before today or more than two years ahead, check-out after check-in */
  // only touch min and max when the day has moved on: rewriting them wipes a half-typed date in Chromium
  const freshen = i => {
    const t = todayISO();
    const m = maxISO();
    if (!i.min || i.min < t) i.min = t;
    if (i.max !== m) i.max = m;
  };
  // WebKit shows today's date in grey in an empty field: the stylesheet swaps it for a hint while this is set
  const mark = i => i.toggleAttribute('data-empty', !i.value);
  $$('input[data-min-today]').forEach(i => {
    freshen(i);
    i.addEventListener('focus', () => freshen(i));
  });
  $$('input[type="date"]').forEach(i => {
    mark(i);
    i.addEventListener('input', () => mark(i));
    i.addEventListener('change', () => mark(i));
  });
  $$('form').forEach(f => {
    const a = f.querySelector('input[name="in"]');
    const b = f.querySelector('input[name="out"]');
    if (!a || !b) return;
    const sync = announce => {
      const t = todayISO();
      const d = parseISO(a.value);
      const lo = d ? iso(addDays(d, 1)) : t;
      b.min = lo > t ? lo : t;
      const o = parseISO(b.value);
      if (d && o && o <= d) {
        b.value = '';
        mark(b);
        if (announce) setError(b, `Choose a check-out date after ${shortDate(d)}.`);
      } else if (b.getAttribute('aria-invalid') === 'true') check(b);
    };
    a.addEventListener('change', () => sync(true));
    b.addEventListener('change', () => { if (b.getAttribute('aria-invalid') === 'true') check(b); });
    sync(false);
  });

  /* compose forms */
  const val = (f, n) => (f.elements[n] ? f.elements[n].value.trim() : '');
  const chosen = (f, n) => {
    const el = f.elements[n];
    return el && el.value ? el.options[el.selectedIndex].text : '';
  };
  const sign = (f, name) => {
    const out = ['', 'Thank you,', name, val(f, 'email')];
    if (val(f, 'phone')) out.push(val(f, 'phone'));
    return out;
  };
  const BUILD = {
    booking(f) {
      const flat = chosen(f, 'flat');
      const a = parseISO(val(f, 'in'));
      const b = parseISO(val(f, 'out'));
      const nights = Math.round((b - a) / 864e5);
      const lines = ['Hello Marc,', '', `I would like to stay at ${flat}. Is it free on these dates?`, '',
        `Check-in: ${longDate(a)}`, `Check-out: ${longDate(b)} (${nights} ${nights === 1 ? 'night' : 'nights'})`,
        `Guests: ${val(f, 'guests')}`];
      if (val(f, 'details')) lines.push('', val(f, 'details'));
      return {
        subject: `Availability: ${flat}, ${shortDate(a)} to ${shortDate(b)}`,
        lines: lines.concat(sign(f, `${val(f, 'first')} ${val(f, 'last')}`.trim())),
      };
    },
    contact(f) {
      return {
        subject: val(f, 'subject') || 'A question for Marc',
        lines: ['Hello Marc,', '', val(f, 'message')].concat(sign(f, val(f, 'name'))),
      };
    },
    service(f) {
      const s = val(f, 'service');
      const lines = ['Hello Marc,', '', `I would like to book this service: ${s}.`];
      if (val(f, 'comments')) lines.push('', val(f, 'comments'));
      return { subject: `Service request: ${s}`, lines: lines.concat(sign(f, val(f, 'name'))) };
    },
    owner(f) {
      const w = val(f, 'where');
      const place = w.startsWith('Elsewhere') ? 'elsewhere in Catalonia' : `in ${w}`;
      return {
        subject: `Owner enquiry: a flat ${place}`,
        lines: ['Hello Marc,', '', `I own a flat ${place} and would like to talk about Merca Stay looking after it.`, '',
          val(f, 'message')].concat(sign(f, val(f, 'name'))),
      };
    },
  };

  $$('form.compose-form').forEach(f => {
    const kind = f.dataset.kind;
    const panel = $(`[data-panel="${kind}"]`);
    const build = BUILD[kind.startsWith('contact') ? 'contact' : kind];
    if (!panel || !build) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      $$('input[data-min-today]', f).forEach(freshen);
      const bad = [...f.elements].filter(el => el.willValidate && el.id).filter(el => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const { subject, lines } = build(f);
      const body = lines.concat('', 'Prepared on the unofficial Merca Stay concept site.').join('\n');
      $('.compose-text', panel).textContent = `Subject: ${subject}\n\n${body}`;
      $('[data-send="mail"]', panel).href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
      $('[data-send="wa"]', panel).href = `${WA}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`;
      $('.copy-status', panel).textContent = '';
      panel.hidden = false;
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
    });
    const recheck = e => { if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') check(e.target); };
    f.addEventListener('input', recheck);
    f.addEventListener('change', recheck);
    // another apartment or guest count can change whether the group fits
    const { flat, guests } = f.elements;
    if (flat && guests && flat.tagName === 'SELECT') {
      flat.addEventListener('change', () => check(guests));
      guests.addEventListener('change', () => check(guests));
    }
  });

  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const panel = btn.closest('.compose-panel');
    const pre = $('.compose-text', panel);
    const status = $('.copy-status', panel);
    let ok = false;
    try {
      await navigator.clipboard.writeText(pre.textContent);
      ok = true;
    } catch (_) {
      const r = document.createRange();
      r.selectNodeContents(pre);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
    }
    status.textContent = ok ? `Copied. Paste it into an email to ${EMAIL} or a WhatsApp message.` : 'Select the text above and copy it.';
  });

  /* services: 'Request this' on a card chooses that service in the form */
  const svc = $('#f-service');
  if (svc) {
    const pick = key => {
      const o = [...svc.options].find(x => x.dataset.key === key);
      if (!o) return false;
      svc.value = o.value;
      svc.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
    const want = new URLSearchParams(location.search).get('service');
    if (want) pick(want);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[data-service]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!pick(a.dataset.service)) return;
      e.preventDefault();
      $('#request').scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
      svc.focus({ preventScroll: true });
    });
  }

  /* photo viewer */
  const box = $('dialog.lightbox');
  if (box && typeof box.showModal === 'function') {
    const pic = $('img', box);
    const cap = $('figcaption', box);
    const count = $('.lb-count', box);
    let items = [];
    let at = 0;
    let opener = null;
    cap.setAttribute('aria-hidden', 'true');
    const show = () => {
      const it = items[at];
      pic.src = it.src;
      pic.alt = it.cap;
      cap.textContent = it.cap;
      // the live count carries the caption, so each step says which photo is showing
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = `: ${it.cap}`;
      count.textContent = `Photo ${at + 1} of ${items.length}`;
      if (it.cap) count.append(sr);
      for (const k of [at + 1, at - 1]) {
        const n = items[(k + items.length) % items.length];
        if (n) (new Image()).src = n.src;
      }
    };
    const step = d => { at = (at + d + items.length) % items.length; show(); };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[data-lightbox]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const seen = new Map();
      $$(`a[data-lightbox="${a.dataset.lightbox}"]`).forEach(x => {
        const i = Number(x.dataset.index);
        if (!seen.has(i)) seen.set(i, { src: x.getAttribute('href'), cap: x.dataset.caption || '' });
      });
      const order = [...seen.keys()].sort((p, q) => p - q);
      items = order.map(i => seen.get(i));
      at = Math.max(0, order.indexOf(Number(a.dataset.index)));
      opener = a;
      document.documentElement.style.overflow = 'hidden';
      box.showModal();
      show();
      $('.lb-next', box).focus();
    });
    $('.lb-prev', box).addEventListener('click', () => step(-1));
    $('.lb-next', box).addEventListener('click', () => step(1));
    $('.lb-close', box).addEventListener('click', () => box.close());
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
    box.addEventListener('click', e => { if (e.target === box || e.target.tagName === 'FIGURE') box.close(); });
    box.addEventListener('close', () => {
      document.documentElement.style.overflow = '';
      pic.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  /* reviews: 24 at a time, filter by language */
  const list = $('.review-list');
  if (list) {
    const per = Number(list.dataset.page) || 24;
    const all = [...list.children];
    const more = $('[data-more]');
    const status = $('.filter-status');
    const chips = $$('.chip-btn[data-lang]');
    let lang = 'all';
    let shown = per;
    const matching = () => all.filter(li => lang === 'all' || li.dataset.lang === lang);
    // Masonry: with two or more columns each card spans as many 4 px rows as its height needs, so a
    // short review leaves no hole under it (second review). One column, or no ResizeObserver, keeps the plain grid.
    const ROW = 4;
    const roOK = 'ResizeObserver' in window;
    let gap = 0;
    const span = h => `span ${Math.ceil((h + gap) / ROW)}`;
    const pack = () => {
      const cs = getComputedStyle(list);
      gap = parseFloat(cs.columnGap) || 0;
      const on = roOK && cs.gridTemplateColumns.trim().split(/\s+/).length > 1;
      list.classList.toggle('masonry', on);
      const vis = on ? all.filter(li => !li.hidden) : [];
      const hs = vis.map(li => li.getBoundingClientRect().height);
      all.forEach(li => { li.style.gridRowEnd = ''; });
      vis.forEach((li, i) => { li.style.gridRowEnd = span(hs[i]); });
    };
    if (roOK) {
      // a card that changes height later (fonts, text zoom) gets a new span; its own height never depends on it
      const ro = new ResizeObserver(es => {
        if (!list.classList.contains('masonry')) return;
        es.forEach(({ target: li, borderBoxSize: b }) => {
          if (!li.hidden) li.style.gridRowEnd = span(b && b[0] ? b[0].blockSize : li.getBoundingClientRect().height);
        });
      });
      all.forEach(li => ro.observe(li));
      let w = list.clientWidth;
      addEventListener('resize', () => { if (list.clientWidth !== w) { w = list.clientWidth; pack(); } });
    }
    const apply = announce => {
      const m = matching();
      all.forEach(li => { li.hidden = true; });
      m.forEach((li, i) => { li.hidden = i >= shown; });
      const visible = Math.min(shown, m.length);
      if (more) {
        more.hidden = visible >= m.length;
        more.textContent = `Show more reviews (${m.length - visible} more)`;
      }
      if (announce && status) status.textContent = `Showing ${visible} of ${m.length} reviews.`;
      pack();
    };
    chips.forEach(btn => btn.addEventListener('click', () => {
      chips.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      lang = btn.dataset.lang;
      shown = per;
      apply(true);
    }));
    if (more) {
      more.addEventListener('click', () => {
        const first = matching()[shown];
        shown += per;
        apply(true);
        if (first) { first.tabIndex = -1; first.focus(); }
      });
    }
    const reveal = () => {
      let id = '';
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      const li = id && document.getElementById(id);
      if (!li || li.parentElement !== list) return;
      const reset = lang !== 'all';
      if (reset) {
        lang = 'all';
        chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === 'all')));
      }
      const i = all.indexOf(li);
      shown = Math.max(shown, Math.ceil((i + 1) / per) * per);
      apply(reset);
      li.tabIndex = -1;
      li.focus({ preventScroll: true });
      // jump straight to the review: a smooth scroll from the top of a long page takes seconds
      try { li.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (_) { li.scrollIntoView({ block: 'center' }); }
    };
    apply(false);
    addEventListener('hashchange', reveal);
    reveal();
  }

  // A wide table scrolls inside its box: when it does, the box takes keyboard focus so it can be scrolled.
  const tables = () => $$('.table-wrap').forEach(w => {
    if (w.scrollWidth > w.clientWidth + 1) {
      w.tabIndex = 0;
      w.setAttribute('role', 'region');
      const cap = w.querySelector('caption') || (w.closest('section') || w).querySelector('h2, h3');
      w.setAttribute('aria-label', cap ? cap.textContent.trim() : 'Table');
    } else if (w.hasAttribute('tabindex')) {
      w.removeAttribute('tabindex');
      w.removeAttribute('role');
      w.removeAttribute('aria-label');
    }
  });
  tables();
  addEventListener('resize', tables);
})();

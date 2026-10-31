/* Six Keys: departure board, chart tooltips, quiz, one film at a time. No libraries. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Departure board: kind status messages, paused by the button or by reduced motion. */
  var status = document.getElementById('board-status');
  var toggle = document.getElementById('board-toggle');
  if (status && toggle) {
    var msgs = ['On time', 'On time (usually)', 'Admiring the Garraf', 'Marc already there', 'Towels board first', 'Sea views: sit left'];
    var i = 0, timer = null;
    var show = function () {
      i = (i + 1) % msgs.length;
      status.textContent = msgs[i];
      status.classList.toggle('alert', i === 2);
      if (!reduce) { status.classList.remove('flip'); void status.offsetWidth; status.classList.add('flip'); }
    };
    var play = function () { timer = window.setInterval(show, 3200); toggle.textContent = 'Pause messages'; toggle.setAttribute('aria-pressed', 'false'); };
    var stop = function () { window.clearInterval(timer); timer = null; toggle.textContent = 'Play messages'; toggle.setAttribute('aria-pressed', 'true'); };
    toggle.addEventListener('click', function () { if (timer) { stop(); } else { show(); play(); } });
    if (reduce) { stop(); } else { play(); }
  }

  /* Chart: crosshair and tooltip on hover, tap or keyboard focus. */
  var COLORS = { bcn: '#C8613C', sit: '#2F7FB8' };
  document.querySelectorAll('.chart-wrap').forEach(function (wrap) {
    var svg = wrap.querySelector('svg');
    var tip = wrap.querySelector('.tip');
    var cross = wrap.querySelector('.cross');
    if (!svg || !tip || !cross) { return; }
    var vb = svg.viewBox.baseVal;
    var hide = function () { tip.classList.remove('on'); cross.setAttribute('visibility', 'hidden'); };
    var showFor = function (hit) {
      var x = parseFloat(hit.dataset.x), top = parseFloat(hit.dataset.top);
      cross.setAttribute('x1', x); cross.setAttribute('x2', x);
      cross.setAttribute('visibility', 'visible');
      tip.innerHTML = '<b>' + hit.dataset.m + '</b>' +
        '<span><i style="background:' + COLORS.bcn + '"></i>Barcelona ' + hit.dataset.bcn + '%</span><br>' +
        '<span><i style="background:' + COLORS.sit + '"></i>Sitges ' + hit.dataset.sit + '%</span>';
      var sr = svg.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      var left = sr.left - wr.left + (x / vb.width) * sr.width;
      var y = sr.top - wr.top + (top / vb.height) * sr.height;
      tip.classList.add('on');
      var half = tip.offsetWidth / 2;
      left = Math.max(half + 4, Math.min(wr.width - half - 4, left));
      tip.style.left = left + 'px';
      tip.style.top = Math.max(tip.offsetHeight + 6, y - 10) + 'px';
    };
    wrap.querySelectorAll('.hit').forEach(function (hit) {
      hit.addEventListener('pointerenter', function () { showFor(hit); });
      hit.addEventListener('pointerdown', function () { showFor(hit); });
      hit.addEventListener('focus', function () { showFor(hit); });
      hit.addEventListener('blur', hide);
    });
    svg.addEventListener('pointerleave', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hide(); } });
  });

  /* Only one film plays at a time. */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  videos.forEach(function (v) {
    v.addEventListener('play', function () { videos.forEach(function (o) { if (o !== v) { o.pause(); } }); });
  });

  /* Quiz: which flat are you? Most votes wins, question 3 breaks a tie. */
  var FLATS = {
    bruc: { name: 'Bruc', city: 'Barcelona', img: 'img/p-bruc.jpg', url: 'https://www.merca-stay-apartments.com/barcelona-bruc/',
      text: '200 m², four bedrooms, beds for 10, a PlayStation 3 and a separate toilet for peace in the Eixample. From €450 a night.',
      quip: 'You are generous, organised and own at least one football.' },
    granvia: { name: 'Gran Via', city: 'Barcelona', img: 'img/p-granvia.jpg', url: 'https://www.merca-stay-apartments.com/barcelona-gran-via/',
      text: 'Three double bedrooms, a sofa bed, a kitchen island and an address 13 kilometres long. From €290 a night.',
      quip: 'You like a big city and a calm bed. You also give very long directions.' },
    balmins: { name: 'Balmins', city: 'Sitges', img: 'img/p-balmins.jpg', url: 'https://www.merca-stay-apartments.com/sitges-balmins/',
      text: 'A studio with a pool, sea views and a terrace made for breakfast. From €90 a night.',
      quip: 'You travel light and wake up early, mostly to look at the sea.' },
    bonaventura: { name: 'Bonaventura', city: 'Sitges', img: 'img/p-bonaventura.jpg', url: 'https://www.merca-stay-apartments.com/sitges-bonaventura/',
      text: '73 m², three bedrooms and two balconies on a quiet street near the station. From €250 a night.',
      quip: 'Good fortune follows you. So does your family, onto both balconies.' },
    poblesec: { name: 'Poble Sec', city: 'Sitges', img: 'img/p-poblesec.jpg', url: 'https://www.merca-stay-apartments.com/sitges-poble-sec/',
      text: 'Two bedrooms, four minutes from Sant Sebastià beach. From €90 a night.',
      quip: 'Your flip-flops are already on. They have been on since March.' },
    mayo: { name: '2 de Mayo', city: 'Sitges', img: 'img/p-mayo.jpg', url: 'https://www.merca-stay-apartments.com/sitges-2-de-mayo/',
      text: 'Three double bedrooms, a bath with a tub and a balcony, a few metres from the beach. From €300 a night.',
      quip: 'You want to be in the middle of everything, then have a long, quiet bath.' }
  };
  var ORDER = ['bruc', 'granvia', 'balmins', 'bonaventura', 'poblesec', 'mayo'];
  var form = document.getElementById('quiz');
  var out = document.getElementById('quiz-result');
  if (form && out) {
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var picks = ['q1', 'q2', 'q3'].map(function (q) { var c = form.querySelector('input[name="' + q + '"]:checked'); return c ? c.value : null; });
      if (picks.indexOf(null) !== -1) {
        out.innerHTML = '<p class="warn">Answer all three questions first. Marc always reads the whole message.</p>';
        return;
      }
      var score = {};
      picks.forEach(function (p) { score[p] = (score[p] || 0) + 1; });
      var best = Math.max.apply(null, ORDER.map(function (k) { return score[k] || 0; }));
      var tied = ORDER.filter(function (k) { return (score[k] || 0) === best; });
      var win = tied.indexOf(picks[2]) !== -1 ? picks[2] : (tied.indexOf(picks[1]) !== -1 ? picks[1] : tied[0]);
      var f = FLATS[win];
      out.innerHTML = '<div class="result-card"><img src="' + f.img + '" alt="" width="1200" height="800">' +
        '<div><p class="flat-kicker">' + esc(f.city) + '</p><h3>You are ' + esc(f.name) + '.</h3>' +
        '<p>' + esc(f.quip) + '</p><p>' + esc(f.text) + '</p>' +
        '<p><a href="' + f.url + '">See the real ' + esc(f.name) + ' flat on merca-stay-apartments.com</a></p></div></div>';
      if (out.scrollIntoView) { out.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
    });
    form.addEventListener('reset', function () { out.innerHTML = ''; });
  }
})();

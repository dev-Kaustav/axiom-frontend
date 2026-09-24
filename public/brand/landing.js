// Three ways a cutting cycle can run. The target rate is a step function: it
// only moves when the committee meets, so every path is flat between the
// meeting gridlines and steps on them. Geometry is in the chart's own 600x180
// viewBox — x 100/220/340/440/520 are MAR/JUN/SEP/NOV/DEC, and y 25/60/95/130
// are 4.75/4.50/4.25/4.00 per cent.
//
// Paths 01 and 03 end the year at the same rate. They pay differently, which is
// the whole point of the section.
const SEP = 340 / 600 * 100;   // where a path first reaches 4.00%
const Y_425 = 95 / 180 * 100;
const Y_400 = 130 / 180 * 100;

const scenarios = {
  stall: {
    title: 'The cuts stop short.', path: '4.75% → 4.25%',
    line: 'M0 25H100V60H220V95H600',
    area: 'M0 25H100V60H220V95H600V165H0Z',
    touch: 0, end: 1000,
    touchAt: null, endsAt: Y_425, endsLabel: 'ENDS 4.25%',
    description: 'Illustrative policy rate path: 4.75 per cent, cut to 4.50 in March and 4.25 in June, then held to year-end',
    insight: 'Two cuts, then the committee holds. The path never reaches 4.00%, so the touch position pays nothing. The NO position pays, because the rate does not end the year at 4.00%.',
  },
  ease: {
    title: 'The cuts keep coming.', path: '4.75% → 4.00%',
    line: 'M0 25H100V60H220V95H340V130H600',
    area: 'M0 25H100V60H220V95H340V130H600V165H0Z',
    touch: 1000, end: 0,
    touchAt: { left: SEP, top: Y_400 }, endsAt: Y_400, endsLabel: 'ENDS 4.00%',
    description: 'Illustrative policy rate path: 4.75 per cent, cut to 4.50 in March, 4.25 in June and 4.00 in September, then held to year-end',
    insight: 'The rate reaches 4.00% in September and is still there in December. One position pays, the other does not. Now try path 03.',
  },
  reverse: {
    title: 'Same year-end rate. Opposite result.', path: '4.75% → 4.00% → 4.25%',
    line: 'M0 25H100V60H220V95H340V130H440V95H600',
    area: 'M0 25H100V60H220V95H340V130H440V95H600V165H0Z',
    touch: 1000, end: 1000,
    touchAt: { left: SEP, top: Y_400 }, endsAt: Y_425, endsLabel: 'ENDS 4.25%',
    description: 'Illustrative policy rate path: 4.75 per cent, cut to 4.50 in March, 4.25 in June and 4.00 in September, then hiked back to 4.25 in November',
    insight: 'Both positions pay. The rate touched 4.00% in September and left again in November. This path ends the year exactly where path 01 ends — and the touch contract settles the other way.',
  },
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function render(scenario) {
  document.getElementById('scenario-title').textContent = scenario.title;
  document.getElementById('path-tag').textContent = scenario.path;
  document.getElementById('rate-chart').setAttribute('aria-label', scenario.description);
  document.getElementById('chart-line').setAttribute('d', scenario.line);
  document.getElementById('chart-area').setAttribute('d', scenario.area);
  document.getElementById('touch-payout').textContent = currency.format(scenario.touch);
  document.getElementById('end-payout').textContent = currency.format(scenario.end);
  document.getElementById('total-payout').textContent = currency.format(scenario.touch + scenario.end);
  document.getElementById('scenario-insight').textContent = scenario.insight;

  const touchPin = document.getElementById('pin-touch');
  touchPin.hidden = !scenario.touchAt;
  if (scenario.touchAt) {
    touchPin.style.left = `${scenario.touchAt.left}%`;
    touchPin.style.top = `${scenario.touchAt.top}%`;
  }
  document.getElementById('pin-end').style.top = `${scenario.endsAt}%`;
  document.getElementById('pin-end-label').textContent = scenario.endsLabel;
}

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-scenario]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render(scenarios[button.dataset.scenario]);
  });
});

// The document ships the `ease` path already drawn; place its pins to match so
// the chart is correct before anyone clicks.
render(scenarios.ease);

// Each hero card names the settlement distinction, not a price correlation.
const connections = {
  decision: 'The October decision changes the rate path. Other contracts in your book ask where that same path goes next.',
  touch: 'A rate can touch 4.50% and fall back before year-end. These two contracts can settle differently.',
  terminal: 'A year-end threshold only checks the final level. A NO position here does not cancel every outcome of a YES touch position.',
};
document.querySelectorAll('[data-market]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-market]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('connection-copy').textContent = connections[button.dataset.market];
  });
});

// Observe decorative section entrances instead of doing work on every scroll.
// Copy is visible by default, including without JavaScript or reduced motion.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const atmosphereSections = document.querySelectorAll('[data-atmosphere]');
let atmosphereObserver;
function observeAtmosphere() {
  atmosphereObserver?.disconnect();
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  atmosphereObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      atmosphereObserver.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
  atmosphereSections.forEach(section => {
    if (!section.classList.contains('is-in-view')) atmosphereObserver.observe(section);
  });
}
observeAtmosphere();
motionPreference.addEventListener('change', observeAtmosphere);


/* ══════════════════════════════════════════════════════════════════════════
   TERMINAL
   One selection drives every panel. The book is aggregated across venues, so
   every level carries the venue it came from — the same grammar the
   aggregation section explains in full.
   ═════════════════════════════════════════════════════════════════════════ */

const num = n => n.toLocaleString('en-US');
const usd = n => '$' + n.toLocaleString('en-US');

const MARKETS = {
  decision: {
    thumb: '/brand/markets/fed-policy.jpg', photo: false, cat: 'FED DECISION',
    short: 'Fed hikes 25 bp in October', yes: 54, no: 46,
    question: 'Will the Fed raise the target range by 25 bp at the October meeting?',
    id: '#2589813', resolves: 'RESOLVES 29 OCT 2026', last: '54¢', chg: '+9¢ / 30D', dir: 'is-up',
    line: 'M0 128 L60 122 L120 132 L180 114 L240 106 L300 110 L360 92 L420 86 L480 74 L540 68 L600 60',
    alt: 'Thirty-day price history: the contract firms from 45 cents to 54 cents.',
    asks: [[57, 19300, 'P·PF'], [56, 34500, 'P·K'], [55, 8400, 'K']],
    bids: [[54, 19800, 'P'], [53, 26600, 'P·K'], [52, 26500, 'K·PF']],
    side: 'YES', qty: 25000, avg: '55.7¢', cost: 13916, ret: 25000, fill: 60,
    note: 'Filled across two venues: 8,400 at 55¢ on Kalshi, 16,600 at 56¢ on Polymarket.',
    related: [
      ['Three or more hikes in 2026', 'YES', 200000, 'IMPLIED BY'],
      ['Fed hikes at the December meeting', 'YES', 250000, 'SHARES DRIVER'],
      ['Another hike before 2027', 'YES', 120000, 'IMPLIED BY'],
    ],
    relationship: 'An October hike is one of the moves “three or more hikes in 2026” counts, and it settles “another hike before 2027” outright. Adding YES here deepens an exposure the book already carries three times.',
    scenarios: [['Hike in October, then hold', 612000, 637000], ['Hold in October, hike in December', 438000, 438000], ['No hike in 2026', 91000, 91000]],
    linked: [0, 1, 2, 5],
    rule: 'This market resolves YES if the Federal Open Market Committee raises the target range for the federal funds rate by 25 basis points at the meeting concluding 29 October 2026, as stated in the Committee’s published statement.',
    hash: 'sha256 4b1e77…a209',
  },
  touch: {
    thumb: '/brand/markets/fed-rate-path.jpg', photo: true, cat: 'RATE PATH',
    short: 'Rates touch 4.50% this year', yes: 31, no: 69,
    question: 'Will the fed funds target range reach 4.50% or higher at any point in 2026?',
    id: '#690200', resolves: 'RESOLVES 31 DEC 2026', last: '31¢', chg: '−4¢ / 30D', dir: 'is-down',
    line: 'M0 78 L60 70 L120 84 L180 76 L240 96 L300 90 L360 106 L420 98 L480 114 L540 108 L600 116',
    alt: 'Thirty-day price history: the contract eases from 35 cents to 31 cents.',
    asks: [[34, 9600, 'K'], [33, 21400, 'P'], [32, 18900, 'P']],
    bids: [[31, 27300, 'P'], [30, 16700, 'K'], [29, 41200, 'P']],
    side: 'YES', qty: 50000, avg: '32.8¢', cost: 16408, ret: 50000, fill: 44,
    note: 'Filled across three price levels and two venues.',
    related: [
      ['Rates end 2026 at 4.50% or higher', 'NO', 250000, 'IMPLIES'],
      ['Rates touch 4.25% this year', 'YES', 200000, 'IMPLIED BY'],
      ['Hike–hike–hike path', 'YES', 180000, 'IMPLIES'],
    ],
    relationship: 'The year-end contract only reads December. This one reads the whole year. A rate that touches 4.50% and falls back pays here <b>and</b> pays your year-end NO — the book is not short this outcome twice.',
    scenarios: [['Touches 4.50%, ends below', 498000, 548000], ['Touches 4.50%, ends at or above', 312000, 362000], ['Never reaches 4.50%', 455000, 455000]],
    linked: [3, 4],
    rule: 'This market resolves YES if the upper bound of the Federal Reserve’s target range for the federal funds rate is 4.50% or higher at any point between 1 January 2026 and 31 December 2026, as published by the Federal Reserve.',
    hash: 'sha256 9f41c2…b7e0',
  },
  terminal: {
    thumb: '/brand/markets/fed-year-end.jpg', photo: true, cat: 'YEAR-END',
    short: 'Rates end 2026 at 4.50%+', yes: 31, no: 69,
    question: 'Will the fed funds target range be 4.50% or higher on 31 December 2026?',
    id: '#1168142', resolves: 'RESOLVES 31 DEC 2026', last: '31¢', chg: '+2¢ / 30D', dir: 'is-up',
    line: 'M0 120 L60 128 L120 116 L180 122 L240 110 L300 118 L360 108 L420 116 L480 104 L540 112 L600 104',
    alt: 'Thirty-day price history: the contract holds near 30 cents and firms to 31.',
    asks: [[34, 7800, 'K'], [33, 11900, 'P'], [32, 22500, 'P']],
    bids: [[31, 18400, 'P'], [30, 24100, 'K'], [29, 12600, 'P']],
    side: 'NO', qty: 40000, avg: '69.5¢', cost: 27816, ret: 40000, fill: 38,
    note: 'NO is priced off the YES book: a 31¢ YES bid is a 69¢ NO ask.',
    related: [
      ['Rates touch 4.50% this year', 'YES', 250000, 'IMPLIED BY'],
      ['Rates end 2026 at 4.25%', 'NO', 200000, 'EXCLUDES'],
      ['Fed hikes at the December meeting', 'YES', 250000, 'SHARES DRIVER'],
    ],
    relationship: 'Adding NO here is the same directional view as the NO 250,000 already held. It does not offset the YES touch position: a rate can reach 4.50% in October and end the year below it, and <b>both pay</b>.',
    scenarios: [['Ends at or above 4.50%', 312000, 312000], ['Touches 4.50%, ends below', 498000, 538000], ['Never reaches 4.50%', 455000, 495000]],
    linked: [1, 3, 4],
    rule: 'This market resolves YES if the upper bound of the Federal Reserve’s target range for the federal funds rate is 4.50% or higher on 31 December 2026, as published by the Federal Reserve.',
    hash: 'sha256 2d8ba4…61fc',
  },
};

const HOLDINGS = [
  ['Oct +25', 'YES', 100000, '48¢', '54¢', 48000, 6000],
  ['Dec +25', 'YES', 250000, '61¢', '68¢', 152500, 17500],
  ['3 hikes', 'YES', 200000, '19¢', '24¢', 38000, 10000],
  ['Touch ≥4.50%', 'YES', 250000, '36¢', '31¢', 90000, -12500],
  ['EOY ≥4.50%', 'NO', 250000, '64¢', '69¢', 160000, 12500],
  ['Another hike', 'YES', 120000, '81¢', '87¢', 97200, 7200],
];

// Cumulative size runs outward from the touch of the book in both directions,
// so the TOTAL column answers "how much can I get within N cents".
function ladder(asks, bids, withTotal) {
  const max = Math.max(...asks.concat(bids).map(r => r[1]));
  const cell = (r, total) =>
    `<div class="lrow ${r.side}"><i style="width:${Math.round(r[1] / max * 100)}%"></i>` +
    `<span>${r[0]}¢</span><span>${num(r[1])}</span>` +
    (withTotal ? `<span>${num(total)}</span>` : '') + `<span>${r[2]}</span></div>`;
  let out = '', run = 0;
  asks.slice().reverse().forEach(r => { run += r[1]; r.total = run; });
  asks.forEach(r => { r.side = 'ask'; out += cell(r, r.total); });
  const spread = bids[0][0] - asks[asks.length - 1][0];
  out += `<div class="lspread"><span>SPREAD</span><b>${Math.abs(spread)}¢</b></div>`;
  run = 0;
  bids.forEach(r => { run += r[1]; r.side = 'bid'; out += cell(r, run); });
  return out;
}

const pick = id => document.getElementById(id);

function renderTerminal(key) {
  const m = MARKETS[key];
  pick('t-question').textContent = m.question;
  pick('t-id').textContent = m.id;
  pick('t-res').textContent = m.resolves;
  pick('t-last').textContent = m.last;
  const chg = pick('t-chg');
  chg.textContent = m.chg;
  chg.className = m.dir;
  pick('t-line').setAttribute('d', m.line);
  pick('t-area').setAttribute('d', m.line + ' L600 180 L0 180 Z');
  pick('t-chart').setAttribute('aria-label', m.alt);
  pick('t-venue').innerHTML = '<span class="venue-symbol" aria-hidden="true">P</span>POLYMARKET';

  pick('t-book').innerHTML = ladder(m.asks, m.bids, true);

  pick('t-yes-price').textContent = m.asks[m.asks.length - 1][0] + '¢';
  pick('t-no-price').textContent = (100 - m.bids[0][0]) + '¢';
  document.querySelector('.ex-yes').classList.toggle('is-on', m.side === 'YES');
  document.querySelector('.ex-no').classList.toggle('is-on', m.side === 'NO');
  pick('t-exec-qty').textContent = num(m.qty);
  pick('t-exec-avg').textContent = m.avg;
  pick('t-exec-cost').textContent = usd(m.cost);
  pick('t-exec-return').textContent = usd(m.ret);
  pick('t-exec-cta').innerHTML = `Buy ${m.side} <span>${usd(m.cost)}</span>`;
  pick('t-exec-note').textContent = m.note;
  const slider = document.querySelector('.exec-slider');
  slider.querySelector('i').style.width = m.fill + '%';
  slider.querySelector('u').style.left = m.fill + '%';

  pick('t-related').innerHTML = m.related.map(([name, side, qty, tag]) =>
    `<li><span class="rel-name">${name}</span><span class="rel-hold">` +
    `<b class="position-${side.toLowerCase()}">${side}</b>${num(qty)}</span>` +
    `<span class="rel-tag">${tag}</span></li>`).join('');
  pick('t-relationship').innerHTML = m.relationship;

  pick('t-scenarios').innerHTML =
    '<div class="payout-row head"><span>OUTCOME</span><span>BEFORE <i></i> AFTER</span></div>' +
    m.scenarios.map(([name, before, after]) =>
      `<div class="payout-row"><span>${name}</span><strong${after === before ? ' class="is-flat"' : ''}>` +
      `${usd(before)} <em>→</em> ${usd(after)}</strong></div>`).join('');

  pick('t-positions').innerHTML = HOLDINGS.map((h, i) => {
    const on = m.linked.includes(i);
    return `<tr${on ? ' class="is-linked"' : ''}><td>${h[0]}</td>` +
      `<td><b class="position-${h[1].toLowerCase()}">${h[1]}</b></td><td>${num(h[2])}</td>` +
      `<td>${h[3]}</td><td>${h[4]}</td><td>${usd(h[5])}</td>` +
      `<td class="${h[6] < 0 ? 'is-down' : 'is-up'}">${h[6] < 0 ? '−' : '+'}${usd(Math.abs(h[6])).slice(1)}</td>` +
      `<td>${on ? '<span class="link-chip">LINKED</span>' : '<span class="link-dash">—</span>'}</td></tr>`;
  }).join('');

  pick('t-rules-title').innerHTML = `POLYMARKET <i></i> ${m.id} <i></i> SETTLEMENT RULE`;
  pick('t-rules-text').textContent = m.rule;
  pick('t-rules-hash').textContent = m.hash;
}

document.querySelectorAll('[data-tmarket]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-tmarket]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderTerminal(b.dataset.tmarket);
  });
});

document.querySelectorAll('[data-ttab]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-ttab]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll('[data-ttabpanel]').forEach(p => { p.hidden = p.dataset.ttabpanel !== b.dataset.ttab; });
  });
});

// The view selector only does anything under the terminal's breakpoint; above
// it every panel is on screen at once and these buttons are hidden.
const term = document.querySelector('[data-terminal]');
document.querySelectorAll('[data-view-btn]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-view-btn]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    term.dataset.view = b.dataset.viewBtn;
  });
});

if (term) renderTerminal('touch');


/* ══════════════════════════════════════════════════════════════════════════
   MARKET AGGREGATION
   Three venue books converge into one composite. The third case is the point:
   a book is left out because its settlement conditions differ, not because its
   title differs.
   ═════════════════════════════════════════════════════════════════════════ */

const BOOK_HIKE = [
  { sym: 'P', name: 'Polymarket', q: 'Fed hikes 25 bp in October', tot: '70.7k', asks: [[57, 14900], [56, 24600]], bids: [[54, 19800], [53, 11400]] },
  { sym: 'K', name: 'Kalshi', q: 'FOMC raises target range 25 bp in October', tot: '52.1k', asks: [[56, 9900], [55, 8400]], bids: [[53, 15200], [52, 18600]] },
  { sym: 'F', name: 'Predict.fun', q: 'Fed hike — October meeting', tot: '27.8k', asks: [[58, 6200], [57, 4400]], bids: [[52, 7900], [51, 9300]] },
];
const COMP_HIKE = {
  asks: [[58, 6200, 'PF'], [57, 19300, 'P·PF'], [56, 34500, 'P·K'], [55, 8400, 'K']],
  bids: [[54, 19800, 'P'], [53, 26600, 'P·K'], [52, 26500, 'K·PF'], [51, 9300, 'PF']],
};

const AGG = {
  merge: {
    books: BOOK_HIKE, comp: COMP_HIKE, q: 'Fed hikes 25 bp in October', total: '150.6k',
    foot: 'Three venues stacked into one ladder. Every level keeps the venue it came from.',
  },
  top: {
    books: BOOK_HIKE, comp: COMP_HIKE, q: 'Fed hikes 25 bp in October', total: '150.6k', best: true,
    foot: 'Best bid on Polymarket, best ask on Kalshi. Alone, Polymarket quotes 54 / 56 — a 2¢ spread. Stacked, the book is 54 / 55 with 42,900 inside two cents.',
  },
  settlement: {
    q: 'Rates touch 4.50% this year', total: '108.7k',
    books: [
      { sym: 'P', name: 'Polymarket', q: 'Rates touch 4.50% this year', tot: '84.3k', asks: [[33, 21400], [32, 18900]], bids: [[31, 27300], [30, 16700]] },
      { sym: 'K', name: 'Kalshi', q: 'Fed funds ≥4.50% at year-end 2026', tot: '58.9k', asks: [[37, 12800], [36, 9400]], bids: [[35, 14600], [34, 22100]], dropped: 'OBSERVATION WINDOW DIFFERS · 31 DEC ONLY' },
      { sym: 'F', name: 'Predict.fun', q: 'Rates touch 4.50% in 2026', tot: '24.4k', asks: [[33, 5100], [32, 6800]], bids: [[31, 4900], [30, 7600]] },
    ],
    comp: {
      asks: [[33, 26500, 'P·PF'], [32, 25700, 'P·PF']],
      bids: [[31, 32200, 'P·PF'], [30, 24300, 'P·PF']],
    },
    foot: 'Kalshi’s contract reads 31 December only; the other two read the whole year. Rook leaves it out of the composite and records the implication between them instead.',
  },
};

function venueBook(b) {
  const max = Math.max(...b.asks.concat(b.bids).map(r => r[1]));
  const rows = (list, side) => list.map(r =>
    `<div class="lrow ${side} compact"><i style="width:${Math.round(r[1] / max * 100)}%"></i>` +
    `<span>${r[0]}¢</span><span>${num(r[1])}</span></div>`).join('');
  const spread = b.bids[0][0] - b.asks[b.asks.length - 1][0];
  return `<div class="agg-book${b.dropped ? ' is-dropped' : ''}">
    <div class="ab-head"><span class="venue-symbol" aria-hidden="true">${b.sym}</span>${b.name}<span class="ab-total">${b.tot}</span></div>
    <div class="ab-q">${b.q}</div>
    <div class="ab-rows">${rows(b.asks, 'ask')}<div class="lspread"><span>SPREAD</span><b>${Math.abs(spread)}¢</b></div>${rows(b.bids, 'bid')}</div>
    ${b.dropped ? `<p class="ab-drop">${b.dropped}</p>` : ''}</div>`;
}

function renderAgg(key) {
  const c = AGG[key];
  document.getElementById('agg-venues').innerHTML = c.books.map(venueBook).join('');
  document.getElementById('agg-q').textContent = c.q;
  document.getElementById('agg-total').textContent = c.total;
  document.getElementById('agg-foot').textContent = c.foot;

  const bestAsk = c.comp.asks[c.comp.asks.length - 1][0], bestBid = c.comp.bids[0][0];
  const max = Math.max(...c.comp.asks.concat(c.comp.bids).map(r => r[1]));
  const row = (r, side, total) => {
    const best = c.best && ((side === 'ask' && r[0] === bestAsk) || (side === 'bid' && r[0] === bestBid));
    return `<div class="lrow ${side}${best ? ' is-best' : ''}"><i style="width:${Math.round(r[1] / max * 100)}%"></i>` +
      `<span>${r[0]}¢</span><span>${num(r[1])}</span><span>${num(total)}</span><span>${r[2]}</span></div>`;
  };
  let out = '', run = 0;
  const asks = c.comp.asks.slice();
  asks.slice().reverse().forEach(r => { run += r[1]; r.total = run; });
  asks.forEach(r => { out += row(r, 'ask', r.total); });
  out += `<div class="lspread"><span>SPREAD</span><b>${Math.abs(bestBid - bestAsk)}¢</b></div>`;
  run = 0;
  c.comp.bids.forEach(r => { run += r[1]; out += row(r, 'bid', run); });
  document.getElementById('agg-composite').innerHTML = out;

  const wrap = document.querySelector('[data-agg]');
  wrap.dataset.case = key;
  wrap.querySelector('.agg-links').classList.toggle('has-dropped', key === 'settlement');
}

document.querySelectorAll('[data-agg-case]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-agg-case]').forEach(x => x.setAttribute('aria-expanded', String(x === b)));
    renderAgg(b.dataset.aggCase);
  });
});
if (document.querySelector('[data-agg]')) renderAgg('merge');


/* ══════════════════════════════════════════════════════════════════════════
   CROSS-MARKET ARBITRAGE
   Four candidates: two that survive costs, one that does not, and one that is
   thrown out because the legs do not partition the outcome space.
   ═════════════════════════════════════════════════════════════════════════ */

const OPPS = [
  {
    type: 'CROSS-VENUE', title: 'Two or more hikes in 2026', status: 'ACTIONABLE', cls: 'ok',
    scan: '47¢ + 49¢ → $1.00', edge: '+2.8¢',
    legs: [['BUY YES', 'P', 'Polymarket', 'Two or more hikes in 2026', '47¢', '18,400'],
           ['BUY NO', 'K', 'Kalshi', 'Fed raises rates 2+ times in 2026', '49¢', '12,900']],
    stats: [['Combined entry', '96.0¢'], ['Size at these prices', '12,900 pairs'], ['Gross difference', '4.0¢'], ['Fees and slippage', '1.2¢'], ['Net per pair', '2.8¢'], ['Net at full size', '$361.20']],
    payouts: [['Two or more hikes in 2026', '$1.00', '$0.00', '$1.00', ''],
              ['Fewer than two hikes', '$0.00', '$1.00', '$1.00', '']],
    evidence: 'Both contracts count increases to the target range at scheduled 2026 FOMC meetings, both resolve on 31 December 2026, and both count a single 50 bp move as one increase. Exactly one leg pays in every outcome.',
    exec: 'Assumes both legs fill at the quoted size, entered together.',
  },
  {
    type: 'RELATED-MARKET', title: 'Touch 4.50% against year-end 4.50%', status: 'ACTIONABLE', cls: 'ok',
    scan: '32¢ + 65¢ → $1.00 or $2.00', edge: '+1.9¢ floor',
    legs: [['BUY YES', 'P', 'Polymarket', 'Rates touch 4.50% at any point in 2026', '32¢', '18,900'],
           ['BUY NO', 'K', 'Kalshi', 'Fed funds ≥4.50% at year-end 2026', '65¢', '14,600']],
    stats: [['Combined entry', '97.0¢'], ['Size at these prices', '14,600 pairs'], ['Gross difference', '3.0¢ floor'], ['Fees and slippage', '1.1¢'], ['Net per pair', '1.9¢ floor'], ['Net at full size', '$277.40 floor']],
    payouts: [['Touches 4.50%, ends at or above', '$1.00', '$0.00', '$1.00', ''],
              ['Touches 4.50%, ends below', '$1.00', '$1.00', '$2.00', 'is-bonus'],
              ['Never reaches 4.50%', '$0.00', '$1.00', '$1.00', '']],
    evidence: 'Ending the year at or above 4.50% requires reaching 4.50% first, so the year-end contract is implied by the touch contract and cannot be worth more. At 32¢ against 35¢ that ordering is inverted. This is the pair the aggregated book refused to merge.',
    exec: 'The middle outcome pays twice. That is upside, not the basis of the trade — the floor holds without it.',
  },
  {
    type: 'CROSS-VENUE', title: 'Touch 4.25% in 2026', status: 'BELOW COST', cls: 'warn',
    scan: '85¢ + 14¢ → $1.00', edge: '−0.2¢',
    legs: [['BUY YES', 'P', 'Polymarket', 'Rates touch 4.25% at any point in 2026', '85¢', '22,000'],
           ['BUY NO', 'K', 'Kalshi', 'Fed funds reached 4.25%+ during 2026', '14¢', '9,300']],
    stats: [['Combined entry', '99.0¢'], ['Size at these prices', '9,300 pairs'], ['Gross difference', '1.0¢'], ['Fees and slippage', '1.2¢'], ['Net per pair', '−0.2¢'], ['Net at full size', '−$18.60']],
    payouts: [['Rate reaches 4.25%', '$1.00', '$0.00', '$1.00', ''],
              ['Rate never reaches 4.25%', '$0.00', '$1.00', '$1.00', '']],
    evidence: 'Resolution source, observation window and threshold all match. The relationship is sound — the gap is simply narrower than the cost of taking it.',
    exec: 'Shown rather than hidden: the same pair becomes actionable if the spread widens by two cents.',
  },
  {
    type: 'RELATED-MARKET', title: 'December cut against any 2026 cut', status: 'REJECTED', cls: 'bad',
    scan: '3.2¢ + 95.0¢ → looks like $1.00', edge: 'no edge',
    legs: [['BUY YES', 'P', 'Polymarket', 'Fed cuts at the December meeting', '3.2¢', '40,000'],
           ['BUY NO', 'K', 'Kalshi', 'Fed cuts rates at any point in 2026', '95.0¢', '26,500']],
    stats: [['Combined entry', '98.2¢'], ['Apparent difference', '1.8¢'], ['Outcomes covered', '2 of 3'], ['Worst case', '$0.00'], ['Outcome that breaks it', 'September cut'], ['Verdict', 'Settlement mismatch']],
    payouts: [['Cut at the December meeting', '$1.00', '$0.00', '$1.00', ''],
              ['No cut anywhere in 2026', '$0.00', '$1.00', '$1.00', ''],
              ['Cut in September, none in December', '$0.00', '$0.00', '$0.00', 'is-bad']],
    evidence: 'Polymarket reads the December statement only. Kalshi reads every 2026 policy change, scheduled or not. The two legs do not partition the outcome space: a cut earlier in the year leaves both worthless against 98.2¢ paid.',
    exec: 'Rook does not report this as an opportunity. The arithmetic that makes it look free is the arithmetic that hides the third outcome.',
  },
];

function renderOpp(i) {
  const o = OPPS[i];
  document.getElementById('scan-detail').innerHTML = `
    <div class="sd-head">
      <div><span class="sd-type">${o.type}</span><h3>${o.title}</h3></div>
      <span class="sd-status is-${o.cls}">${o.status}</span>
    </div>
    <div class="sd-legs">
      <div class="sd-row head"><span>LEG</span><span>VENUE</span><span>CONTRACT</span><span>PRICE</span><span>SIZE</span></div>
      ${o.legs.map(l => `<div class="sd-row"><span class="sd-side">${l[0]}</span>` +
        `<span><span class="venue-symbol" aria-hidden="true">${l[1]}</span>${l[2]}</span>` +
        `<span class="sd-contract">${l[3]}</span><span>${l[4]}</span><span>${l[5]}</span></div>`).join('')}
    </div>
    <dl class="sd-stats">${o.stats.map(s => `<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('')}</dl>
    <div class="payouts sd-payouts">
      <div class="payout-row head"><span>MODELLED OUTCOME</span><span>LEG 1 <i></i> LEG 2 <i></i> COMBINED</span></div>
      ${o.payouts.map(p => `<div class="payout-row ${p[4]}"><span>${p[0]}</span>` +
        `<strong>${p[1]} <em>+</em> ${p[2]} <em>=</em> ${p[3]}</strong></div>`).join('')}
    </div>
    <div class="sd-eq">
      <span class="impact-label">SETTLEMENT EVIDENCE</span>
      <p>${o.evidence}</p>
      <p class="sd-exec">${o.exec}</p>
    </div>`;
}

const scanRows = document.querySelector('.scan-rows');
if (scanRows) {
  scanRows.innerHTML = OPPS.map((o, i) =>
    `<button class="scan-row" type="button" data-opp="${i}" aria-pressed="${i === 0}">
      <span class="sr-top"><span class="sr-type">${o.type}</span><span class="sr-edge is-${o.cls}">${o.edge}</span></span>
      <span class="sr-title">${o.title}</span>
      <span class="sr-math">${o.scan}</span>
    </button>`).join('');
  scanRows.querySelectorAll('[data-opp]').forEach(b => {
    b.addEventListener('click', () => {
      scanRows.querySelectorAll('[data-opp]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      renderOpp(+b.dataset.opp);
    });
  });
  renderOpp(0);
}

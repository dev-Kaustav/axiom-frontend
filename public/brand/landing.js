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

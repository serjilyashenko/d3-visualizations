/* global Margin, LineChart */

(async function() {
  const selector = '#chart-area-2';
  const diagramMargin = new Margin(50, 10, 20, 60);
  const diagram = new LineChart(selector, diagramMargin, d => new Date(d.key), d => d.value);

  const startDate = '2013-09-01';
  const endDate = d3.timeFormat('%Y-%m-%d')(new Date());
  const btcURL = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`;
  const rawData = await d3.json(btcURL);

  const allRange = d3.map(rawData.bpi).entries();

  await new Promise(resolve => setTimeout(resolve, 500));

  const rangeButtons = Array.prototype.slice.apply(document.querySelectorAll('.range-button'));
  rangeButtons.forEach(rb => {
    const range = rb.getAttribute('range');
    const selectedRange = range ? allRange.slice(-1 * range) : allRange;
    rb.addEventListener('click', () => diagram.draw(selectedRange));
  });

  diagram.draw(allRange);
})();

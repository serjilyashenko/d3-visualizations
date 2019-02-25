/* global Margin, LineChart, ScaleLine */

(async function() {
  const sliderLineMargin = new Margin(1, 0, 1, 0);
  const diagramMargin = new Margin(50, 10, 20, 60);
  const sliderDiagram = new ScaleLine('#chart-slider-area', sliderLineMargin, d => new Date(d.key), d => d.value);
  const diagram = new LineChart('#coin-stars-chart-area', diagramMargin, d => new Date(d.key), d => d.value);
  const dSlider = new DoubleSlider('d-slider', 1, 1001, 200);

  // dSlider.setLowPosition(100000);

  const startDate = '2013-09-01';
  const endDate = d3.timeFormat('%Y-%m-%d')(new Date());
  const btcURL = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`;
  const rawData = await d3.json(btcURL);

  const allRange = d3.map(rawData.bpi).entries();
  const initRange = allRange.slice(-1 * 180);

  await new Promise(resolve => setTimeout(resolve, 500));

  const rangeButtons = Array.prototype.slice.apply(document.querySelectorAll('.range-button'));
  rangeButtons.forEach(rb => {
    const range = rb.getAttribute('range');
    const selectedRange = range ? allRange.slice(-1 * range) : allRange;
    rb.addEventListener('click', () => diagram.draw(selectedRange));
  });

  sliderDiagram.draw(allRange);
  diagram.draw(initRange);
})();

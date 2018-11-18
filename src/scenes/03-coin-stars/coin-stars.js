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
  const selectedRange = allRange.slice(-600);

  await new Promise(resolve => setTimeout(resolve, 500));

  diagram.draw(selectedRange);
})();

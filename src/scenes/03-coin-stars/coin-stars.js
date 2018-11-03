/* global Margin, LineChart */

(async function() {
  const selector = '#chart-area-2';
  const margin = new Margin(50, 10, 60, 60);
  const diagram = new LineChart(selector, margin, d => new Date(d.key), d => d.value);

  const startDate = '2013-09-01';
  const endDate = d3.timeFormat('%Y-%m-%d')(new Date());
  const btcURL = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`;
  const rawData = await d3.json(btcURL);

  const data = d3.map(rawData.bpi).entries();

  await new Promise(resolve => setTimeout(resolve, 500));

  diagram.draw(data);
})();

/* global Margin, BarChart */

(async function() {
  const selector = '#chart-area-2';
  const margin = new Margin(50, 10, 60, 60);
  const diagram = new BarChart(selector, margin, d => d.month, d => d.revenue);
  const rawData = await d3.json('./data.json');
  const data = rawData.map(d =>
    Object.assign({}, d, {
      profit: Number(d.profit),
      revenue: Number(d.revenue)
    })
  );

  let isProfit = false;

  d3.interval(() => {
    const valueKey = isProfit ? 'revenue' : 'profit';
    const modifiedData = isProfit ? data.slice(0, -2) : data.slice(1);
    isProfit = !isProfit;
    diagram.ySelector = d => d[valueKey];
    diagram.draw(modifiedData);
  }, 2500);

  diagram.draw(data);
})();

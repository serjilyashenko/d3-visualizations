(async function() {
  const margin = { left: 100, right: 10, top: 10, bottom: 100 };
  const canvasWidth = 600;
  const canvasHeight = 400;
  const width = canvasWidth - margin.left - margin.right;
  const height = canvasHeight - margin.top - margin.bottom;
  const delay = d3.transition().duration(750);

  const svg = d3
    .select('#chart-area')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  const scatterPlot = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  const rawData = await d3.json('./data.json');
  const data = rawData.map(d =>
    Object.assign({}, d, {
      profit: Number(d.profit),
      revenue: Number(d.revenue)
    })
  );

  const xScale = d3
    .scaleBand()
    .range([0, width])
    .paddingOuter(0.3)
    .paddingInner(0.3);
  const yScale = d3.scaleLinear().range([0, height]);
  const yScaleReverse = d3.scaleLinear().range([height, 0]);

  const xAxisGroup = scatterPlot
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`);

  const yAxisGroup = scatterPlot.append('g').attr('class', 'y-axis');

  scatterPlot
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', width / 2)
    .attr('y', height + 60)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .text('Month');

  const yAxisLabel = scatterPlot
    .append('text')
    .attr('class', 'y-axis-label')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('transform', 'rotate(-90)');

  const update = (data, valueKey) => {
    xScale.domain(data.map(d => d.month));
    yScale.domain([0, d3.max(data.map(d => d[valueKey]))]);
    yScaleReverse.domain([0, d3.max(data.map(d => d[valueKey]))]);

    const xAxis = d3.axisBottom(xScale);
    xAxisGroup
      .transition(delay)
      .call(xAxis)
      .selectAll('text')
      .attr('y', 10)
      .attr('x', -5)
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)');

    const yAxis = d3
      .axisLeft(yScaleReverse)
      .ticks(15)
      .tickFormat(d => `$${d}`);

    yAxisGroup.transition(delay).call(yAxis);

    yAxisLabel.transition(delay).text(valueKey[0].toUpperCase() + valueKey.slice(1));

    const circles = scatterPlot.selectAll('circle').data(data, d => d.month);

    circles
      .exit()
      .transition(delay)
      .attr('fill', '#DC7633')
      .attr('r', 0)
      .remove();

    circles
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
      .attr('cy', height)
      .attr('r', 0)
      .attr('fill', '#58D68D')
      .merge(circles)
      .transition(delay)
      .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
      .attr('cy', d => yScaleReverse(d[valueKey]))
      .attr('r', 5);
  };

  let isProfit = false;

  d3.interval(() => {
    const valueKey = isProfit ? 'revenue' : 'profit';
    const modifiedData = isProfit ? data : data.slice(1);
    isProfit = !isProfit;
    update(modifiedData, valueKey);
  }, 2000);

  update(data, 'revenue');
})();

(async function() {
  const margin = { left: 100, top: 10, right: 10, bottom: 100 };
  const canvasWidth = 600;
  const canvasHeight = 400;
  const width = canvasWidth - margin.left - margin.right;
  const height = canvasHeight - margin.top - margin.bottom;
  const t = d3.transition().duration(1000);

  const svg = d3
    .select('#chart-area')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  const gapMinder = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // X-Axis
  const xScale = d3.scaleLog().range([0, width]);
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(0)
    .tickFormat(d => `$${d}`);
  const xAxisGroup = gapMinder
    .append('g')
    .call(xAxis)
    .attr('transform', `translate(0, ${height})`);

  // Y-Axis
  // const yScale = d3.scaleLinear().range([0, height]);
  const yScaleReverse = d3.scaleLinear().range([height, 0]);
  const yAxis = d3.axisLeft(yScaleReverse).ticks(0);
  const yAxisGroup = gapMinder.append('g').call(yAxis);

  // R-Axis
  const rScale = d3.scaleLinear().range([4, 80]);

  // Color-Axis
  const colorScale = d3.scaleOrdinal(d3.schemePaired);

  // X-Axis-Label
  gapMinder
    .append('text')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .text('GDP Per Capita ($)');

  // Y-Axis-Label
  gapMinder
    .append('text')
    .attr('x', -height / 2)
    .attr('y', -40)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .text('Life Expectancy (Years)');

  // Year Mark
  const yearMark = gapMinder
    .append('text')
    .attr('x', width)
    .attr('y', height - 10)
    .attr('text-anchor', 'end')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '40px')
    .attr('fill', '#a1a0a1');

  // Data
  const data = await d3.json('./data.json');
  const maxLifeExpByYears = data.map(it => d3.max(it.countries, d => d.life_exp));
  const maxLifeExp = Math.ceil(d3.max(maxLifeExpByYears) / 10) * 10;
  const maxIncomeByYears = data.map(it => d3.max(it.countries, d => d.income));
  const maxIncome = Math.ceil(d3.max(maxIncomeByYears) / 10) * 10;
  const maxPopulationByYears = data.map(it => d3.max(it.countries, d => d.population));
  const maxPopulation = d3.max(maxPopulationByYears);
  const countries = data[0].countries.map(d => d.country);

  const initialDraw = () => {
    xScale.domain([300, maxIncome]);
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(2)
      .tickFormat(d => `$${d}`);
    xAxisGroup.transition(t).call(xAxis);

    yScaleReverse.domain([0, maxLifeExp]);
    const yAxis = d3.axisLeft(yScaleReverse);
    yAxisGroup.transition(t).call(yAxis);

    rScale.domain([0, maxPopulation]);

    colorScale.domain(countries);
  };

  initialDraw();

  await new Promise(resolve => setTimeout(() => resolve(), 750));

  const update = data => {
    const countries = data.countries
      .filter(country => country.population)
      .filter(country => country.income)
      .filter(country => country.life_exp)
      .sort((a, b) => a.population < b.population);
    yearMark.text(data.year);

    let circles = gapMinder.selectAll('circle').data(countries, d => d.country);

    circles.exit().remove();

    circles
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.income))
      .attr('cy', d => yScaleReverse(d.life_exp))
      .merge(circles)
      .transition(d3.transition().duration(100))
      .attr('stroke', 'black')
      .attr('r', d => rScale(d.population))
      .attr('cx', d => xScale(d.income))
      .attr('cy', d => yScaleReverse(d.life_exp))
      .attr('fill', d => colorScale(d.country));
  };

  update(data[0]);

  let index = 0;
  d3.interval(() => {
    update(data[index]);
    if (index >= data.length - 1) {
      index = 0;
    } else {
      index++;
    }
  }, 100);
})();

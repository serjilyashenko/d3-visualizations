/**
 * Class representing margin indents
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class Margin {
  /**
   * Create a margin indents object
   * @param {number} top - The top margin
   * @param {number} right - The right margin
   * @param {number} bottom - The bottom margin
   * @param {number} left - The left margin
   */
  constructor(top, right, bottom, left) {
    this.top = top;
    this.right = right || top;
    this.bottom = bottom || top;
    this.left = left || right || top;
  }
}

/**
 * Creates
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class Gapminder {
  constructor(selector, margin) {
    this.margin = margin;
    this.t = d3.transition().duration(400);
    this.area = this._createArea(selector);
  }

  /**
   * Create svg canvas area
   * @param {string} selector - The query selector
   */
  _createArea(selector) {
    const margin = this.margin;
    const chartArea = d3.select(selector);
    const canvasWidth = chartArea.node().offsetWidth;
    const canvasHeight = 500;
    const svg = chartArea
      .append('svg')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    return svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  }

  /**
   * Update svg canvas area or create it
   */
  _updateArea() {
    const t = this.t;
    const margin = this.margin;
    this.area.transition(t).attr('transform', `translate(${margin.left},${margin.top})`);
    return this;
  }

  /**
   * Update svg canvas area with new margin
   * @param {Margin} margin
   */
  setMargin(margin) {
    this.margin = margin;
    this._updateArea();
    // TODO: update axis
    // TODO: update diagram
    return this;
  }

  renderAxis() {}

  renderUpdate() {
    // TODO: update diagram
  }
}

/**
 * Creates gapminder diagram
 *
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
const GapminderLegacy = async function(data) {
  const chartArea = d3.select('#chart-area');
  const canvasWidth = chartArea.node().offsetWidth;
  const canvasHeight = 500;
  const margin = { left: 60, top: 50, right: 10, bottom: 60 };
  const width = canvasWidth - margin.left - margin.right;
  const height = canvasHeight - margin.top - margin.bottom;
  const t = d3.transition().duration(1000);

  const svg = chartArea
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
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // X-Axis-Label
  gapMinder
    .append('text')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .text('GDP Per Capita ($)');

  // Y-Axis-Label
  gapMinder
    .append('text')
    .attr('x', -height / 2)
    .attr('y', -40)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Life Expectancy (Years)');

  // Year Mark
  const yearMark = gapMinder
    .append('text')
    .attr('x', width)
    .attr('y', height - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', '40px')
    .attr('fill', '#a1a0a1');

  // Legend
  const legend = gapMinder.append('g').attr('transform', `translate(${width - 10}, ${height - 120})`);

  // Tooltip
  const tooltip = chartArea
    .append('div')
    .attr('class', 'tooltip')
    .html('hello');

  // Data
  // const data = await d3.json('./data.json');
  const maxLifeExpByYears = data.map(it => d3.max(it.countries, d => d.life_exp));
  const maxLifeExp = Math.ceil(d3.max(maxLifeExpByYears) / 10) * 10;
  const maxIncomeByYears = data.map(it => d3.max(it.countries, d => d.income));
  const maxIncome = Math.ceil(d3.max(maxIncomeByYears) / 10) * 10;
  const maxPopulationByYears = data.map(it => d3.max(it.countries, d => d.population));
  const maxPopulation = d3.max(maxPopulationByYears);
  const continents = data[0].countries
    .map(d => d.continent)
    .reduce((res, d) => (res.includes(d) ? res : [...res, d]), []);

  /**
   * Render Continent Legend
   *
   * @param {Array<string>} continents
   */
  const renderLegend = continents => {
    const legendRows = legend
      .selectAll('g')
      .data(continents)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legendRows
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', colorScale);

    legendRows
      .append('text')
      .attr('class', 'continent-label')
      .attr('x', -10)
      .attr('y', 10)
      .attr('text-anchor', 'end')
      .text(d => d);
  };

  /**
   * Build Content for tooltip
   *
   * @param {Object} country country data object
   */
  const buildTooltipContent = ({ country, population, life_exp, income }) => {
    return `
      <div class="content"><span class="label">Country:</span> ${country}</div>
      <div class="content"><span class="label">Population:</span> ${d3.format(',')(population)}</div>
      <div class="content"><span class="label">GDP Per Capita:</span> ${d3.format('$,.0f')(income)}</div>
      <div class="content"><span class="label">Life Expectancy:</span> ${d3.format('.2f')(life_exp)}</div>
      `;
  };

  /**
   * Render Info Tooltip
   *
   * @param {Object} country country data object
   */
  const renderTooltip = country =>
    tooltip
      .html(buildTooltipContent(country))
      .style('left', `${xScale(country.income) + margin.left + 10 + rScale(country.population)}px`)
      .style('top', `${yScaleReverse(country.life_exp) + margin.top - 12}px`)
      .transition(d3.transition().duration(100))
      .style('opacity', 1);

  /**
   * Hide Info Tooltip
   */
  const hideTooltip = () => tooltip.transition(d3.transition().duration(500)).style('opacity', 0);

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

    colorScale.domain(continents);

    renderLegend(continents);
  };

  initialDraw();

  // Waiting until initialDraw finish
  await new Promise(resolve => setTimeout(() => resolve(), 750));

  const show = index => {
    // TODO: optimize this. It is enough to filter ones.
    const i = index < data.length ? index : data.length - 1;
    const data1 = data[index];
    const countries = data1.countries
      .filter(country => country.population)
      .filter(country => country.income)
      .filter(country => country.life_exp)
      .sort((a, b) => a.population < b.population);
    yearMark.text(data1.year);

    let circles = gapMinder.selectAll('circle').data(countries, d => d.country);

    circles.exit().remove();

    circles
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.income))
      .attr('cy', d => yScaleReverse(d.life_exp))
      .on('mouseover', renderTooltip)
      .on('mouseout', hideTooltip)
      .merge(circles)
      .transition(d3.transition().duration(100))
      .ease(d3.easeLinear)
      .attr('stroke', 'black')
      .attr('r', d => rScale(d.population))
      .attr('cx', d => xScale(d.income))
      .attr('cy', d => yScaleReverse(d.life_exp))
      .attr('fill', d => colorScale(d.continent));
  };

  // show(data[170]);

  return {
    show
  };
};

(async function() {
  const data = await d3.json('./data.json');
  const gapminder = await GapminderLegacy(data);

  // Gapminder slider control
  const slider = new Slider('slider');

  // Gapminder autoplay
  const playButton = window.document.getElementById('play-stop');
  let index = 0;
  const createTimer = () =>
    d3.interval(() => {
      gapminder.show(index);
      slider.setPosition((index * 100) / data.length);
      index = index >= data.length - 1 ? 0 : index + 1;
    }, 100);

  let timer = createTimer();

  playButton.addEventListener('click', () => {
    if (timer) {
      timer.stop();
      timer = null;
    } else {
      timer = createTimer();
    }
  });

  slider.onChange(position => {
    const temp = Math.round((position * data.length) / 100);
    index = Slider.range(temp, 0, data.length - 1);
    gapminder.show(index);
  });
})();

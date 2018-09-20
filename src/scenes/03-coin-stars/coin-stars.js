/* global d3, Margin */

/**
 * Class representing diagram rendering
 * @requires d3
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class Diagram {
  /**
   * Create a diagram instance
   * @param {string} selector - The css selector
   * @param {Margin} margin - The instance of the Margin class
   */
  constructor(selector, margin) {
    this.t = d3.transition().duration(400);
    this.chartArea = d3.select(selector);
    this.margin = margin;

    const svg = this.chartArea
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
    this.diagram = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    this.xScale = null;
    this.yScale = null;
    this.yScaleReverse = null;
    this.initScales();
    this.resizeScales();

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  get width() {
    const canvasWidth = this.chartArea.node().offsetWidth;
    return canvasWidth - this.margin.left - this.margin.right;
  }

  get height() {
    const canvasHeight = this.chartArea.node().offsetHeight;
    return canvasHeight - this.margin.top - this.margin.bottom;
  }

  /**
   * Update svg canvas area
   */
  updateArea() {
    const t = this.t;
    const margin = this.margin;
    this.svgArea.transition(t).attr('transform', `translate(${margin.left},${margin.top})`);
    return this;
  }

  /**
   * Set new margin and handle this
   * @param {Margin} margin - The instance of the Margin class
   */
  setMargin(margin) {
    this.margin = margin;
    this.updateArea();
    // TODO: update axis
    // TODO: update diagram
    return this;
  }

  initScales() {
    this.xScale = d3.scaleBand().range([0, this.width]);
    this.yScale = d3.scaleLinear().range([0, this.height]);
    this.yScaleReverse = d3.scaleLinear().range([this.height, 0]);
  }

  handleResize() {
    this.resizeScales();
    this.resizeElements();
  }

  resizeScales() {
    this.xScale.range([0, this.width]);
    this.yScale.range([0, this.height]);
    this.yScaleReverse.range([this.height, 0]);
  }

  updateScales(data) {
    this.xScale.domain(data.map(d => d.month));
    this.yScale.domain([0, d3.max(data.map(d => d['profit']))]);
    this.yScaleReverse.domain([0, d3.max(data.map(d => d['profit']))]);
  }

  // naming !
  applyElements(elements) {
    elements
      .attr('x', d => this.xScale(d.month))
      .attr('y', d => this.yScaleReverse(d['profit']))
      .attr('width', this.xScale.bandwidth)
      .attr('height', d => this.yScale(d['profit']));
  }

  resizeElements() {
    const elements = this.elements;
    this.applyElements(elements);
  }

  removeElements() {}

  createElements() {}

  updateElements() {
    const elements = this.elements.transition(200);
    this.applyElements(elements);
  }

  draw(data) {
    this.updateScales(data);

    const elements = this.diagram.selectAll('rect').data(data, d => d.month);

    elements
      .exit()
      .transition(200)
      .attr('fill', '#DC7633')
      .attr('y', this.height)
      .attr('height', 0)
      .remove();

    this.elements = elements
      .enter()
      .append('rect')
      .attr('x', d => this.xScale(d.month))
      .attr('y', this.height)
      .attr('width', this.xScale.bandwidth)
      .attr('height', 0)
      .attr('fill', '#58D68D')
      .merge(elements);

    this.updateElements();
  }
}

class BarChart extends Diagram {
  initScales() {
    super.initScales();
    this.xScale.paddingOuter(0.3).paddingInner(0.3);
  }
}

(async function() {
  const selector = '#chart-area';
  const margin = new Margin(50, 10, 60, 60);
  const diagram = new BarChart(selector, margin);
  const rawData = await d3.json('./data.json');
  const data = rawData.map(d =>
    Object.assign({}, d, {
      profit: Number(d.profit),
      revenue: Number(d.revenue)
    })
  );
  diagram.draw(data);
})();

/**
 * Class representing diagram with Axis rendering
 * @requires d3
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class AxisDiagram extends Diagram {
  constructor(selector, margin) {
    super(selector, margin);

    this.xScale = null;
    this.xAxisGroup = null;
    this.initXAxis();
    this.resizeXAxis();
    this.updateXAxis();

    this.yScaleReverse = null;
    this.yAxisGroup = null;
  }

  initXAxis() {
    this.xScale = d3.scaleLinear();
    this.xAxisGroup = this.diagram.append('g');
  }

  initYAxis() {
    this.yScaleReverse = d3.scaleLinear().range([this.height, 0]);
    const yAxis = d3.axisLeft(this.yScaleReverse).ticks(0);
    this.yAxisGroup = this.diagram.append('g').call(yAxis);
  }

  getXAxis() {
    return d3.axisBottom(this.xScale);
  }

  resizeXAxis() {
    this.xScale.range([0, this.width]);
    const xAxis = this.getXAxis();
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${this.height})`);
  }

  updateXAxis() {
    this.xScale.domain([undefined, undefined]);
    const xAxis = this.getXAxis();
    this.xAxisGroup.transition(200).call(xAxis);
  }

  handleResize() {
    super.handleResize();
    this.resizeXAxis();
  }

  update() {}
}

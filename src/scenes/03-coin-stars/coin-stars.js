/* global d3, Margin */

/**
 * Class representing scales diagram rendering
 * @requires d3
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class ScalesDiagram {
  /**
   * Create a diagram instance
   * @constructor
   * @param {string} selector - The css selector
   * @param {Margin} margin - The instance of the Margin class
   */
  constructor(selector, margin, xSelector, ySelector) {
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

    this.xSelector = xSelector;
    this.ySelector = ySelector;

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

  resizeElements() {
    console.log('>> Method needs to be override');
  }

  updateScales(data) {
    this.xScale.domain(data.map(this.xSelector));
    this.yScale.domain([0, d3.max(data.map(this.ySelector))]);
    this.yScaleReverse.domain([0, d3.max(data.map(this.ySelector))]);
  }

  draw(data) {
    this.updateScales(data);
  }
}

class BarChart extends ScalesDiagram {
  initScales() {
    super.initScales();
    this.xScale.paddingOuter(0.3).paddingInner(0.3);
  }

  resizeElements() {
    this.updateElements(this.elements);
  }

  createElements(elements) {
    return elements
      .enter()
      .append('rect')
      .attr('x', d => this.xScale(this.xSelector(d)))
      .attr('y', this.height)
      .attr('width', this.xScale.bandwidth)
      .attr('height', 0)
      .attr('fill', '#58D68D');
  }

  updateElements(elements) {
    elements
      .attr('x', d => this.xScale(this.xSelector(d)))
      .attr('y', d => this.yScaleReverse(this.ySelector(d)))
      .attr('width', this.xScale.bandwidth)
      .attr('height', d => this.yScale(this.ySelector(d)));
  }

  firstUpdate(elements) {
    elements
      .exit()
      .transition(200)
      .attr('fill', '#DC7633')
      .attr('y', this.height)
      .attr('height', 0)
      .remove();
  }

  secondUpdate(elements) {
    elements
      .transition(200)
      .delay(300)
      .attr('y', d => this.yScaleReverse(this.ySelector(d)))
      .attr('height', d => this.yScale(this.ySelector(d)));
  }

  thirdUpdate(elements) {
    elements.attr('x', d => this.xScale(this.xSelector(d))).attr('width', this.xScale.bandwidth);
  }

  firstDraw() {
    this.updateElements(this.elements.transition(300));
  }

  updateDraw(elements) {
    this.firstUpdate(elements);
    this.secondUpdate(elements);
    this.thirdUpdate(this.elements.transition(300).delay(600));
    this.updateElements(this.elements.transition(300).delay(900));
  }

  draw(data) {
    super.draw(data);

    const elements = this.diagram.selectAll('rect').data(data, this.xSelector);
    const newElements = this.createElements(elements);

    this.createElements(elements);

    if (!this.elements) {
      this.elements = newElements;
      this.firstDraw();
    } else {
      this.elements = newElements.merge(elements);
      this.updateDraw(elements);
    }
  }
}

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
  }, 1500);

  diagram.draw(data);
})();

/**
 * Class representing diagram with Axis rendering
 * @requires d3
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 */
class AxisDiagram extends ScalesDiagram {
  /**
   * Create an axis diagram instance
   * @constructor
   * @param {string} selector - The css selector
   * @param {Margin} margin - The instance of the Margin class
   */
  constructor(selector, margin) {
    super(selector, margin);

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
}

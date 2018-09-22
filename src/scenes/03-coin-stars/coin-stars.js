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

  xExtent(data) {
    return [0, d3.max(data.map(this.xSelector))];
  }

  yExtent(data) {
    return [0, d3.max(data.map(this.ySelector))];
  }

  updateScales(xExtent, yExtent) {
    this.xScale.domain(xExtent);
    this.yScale.domain(yExtent);
    this.yScaleReverse.domain(yExtent);
  }

  draw(data) {
    const xExtent = this.xExtent(data);
    const yExtent = this.yExtent(data);
    this.updateScales(xExtent, yExtent);
  }
}

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
  constructor(selector, margin, xSelector, ySelector) {
    super(selector, margin, xSelector, ySelector);

    this.xAxisGroup = null;
    this.yAxisGroup = null;
    this.initAxis();
    this.resizeAxis();
  }

  initAxis() {
    this.xAxisGroup = this.diagram.append('g');
    this.yAxisGroup = this.diagram.append('g');
  }

  getXAxis() {
    return d3.axisBottom(this.xScale);
  }

  getYAxis() {
    return d3.axisLeft(this.yScaleReverse);
  }

  resizeAxis() {
    this.xScale.range([0, this.width]);
    this.yScale.range([0, this.height]);
    this.yScaleReverse.range([this.height, 0]);
    const xAxis = this.getXAxis();
    const yAxis = this.getYAxis().ticks(0);
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${this.height})`);
    this.yAxisGroup
      .call(yAxis)
      .selectAll('text')
      .attr('opacity', 0);
  }

  updateXAxis(transition) {
    const xAxis = this.getXAxis();
    return this.xAxisGroup.transition(transition).call(xAxis);
  }

  firstUpdateYAxis(t) {
    const yAxis = this.getYAxis();
    this.yAxisGroup
      .call(yAxis)
      .selectAll('text')
      .attr('opacity', 0);
    this.updateYAxis(t);
  }

  updateYAxis(transition) {
    const yAxis = this.getYAxis();
    this.yAxisGroup
      .transition(transition)
      .call(yAxis)
      .selectAll('text')
      .attr('opacity', 1);
    return this.yAxisGroup;
  }

  handleResize() {
    super.handleResize();
    this.resizeAxis();
  }
}

class BarChart extends AxisDiagram {
  initScales() {
    super.initScales();
    this.xScale.paddingOuter(0.3).paddingInner(0.3);
  }

  xExtent(data) {
    return data.map(this.xSelector);
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

  removeElements(elements) {
    elements
      .attr('fill', '#DC7633')
      .attr('y', this.height)
      .attr('height', 0)
      .remove();
  }

  secondUpdate(elements) {
    elements.attr('y', d => this.yScaleReverse(this.ySelector(d))).attr('height', d => this.yScale(this.ySelector(d)));
  }

  thirdUpdate(elements, transition) {
    elements
      .transition(transition)
      .attr('x', d => this.xScale(this.xSelector(d)))
      .attr('width', this.xScale.bandwidth);
  }

  updateXAxis(transition) {
    const xAxis = this.getXAxis();
    this.xAxisGroup
      .transition(transition)
      .call(xAxis)
      .selectAll('text')
      .attr('y', 10)
      .attr('x', -5)
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-40)');
    return this.xAxisGroup;
  }

  firstDraw() {
    const t = d3.transition().duration(700);
    this.updateXAxis(t);
    this.firstUpdateYAxis(t);
    this.updateElements(
      this.elements
        .transition()
        .duration(700)
        .delay(700)
    );
  }

  updateDraw(elements) {
    const t1 = d3.transition().duration(400);
    this.removeElements(elements.exit().transition(t1));

    const t2 = d3
      .transition()
      .duration(400)
      .delay(400);
    this.updateYAxis(t2);
    this.secondUpdate(elements.transition(t2));

    const t3 = d3
      .transition()
      .duration(200)
      .delay(800);
    this.updateXAxis(t3);
    this.thirdUpdate(elements, t3);

    const t4 = d3
      .transition()
      .duration(400)
      .delay(1000);
    this.updateElements(this.elements.transition(t4));
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
  }, 2500);

  diagram.draw(data);
})();

/* global d3, Margin */

/**
 * Class representing scales diagram rendering.
 * Responsive and Supports window resizing.
 * @requires d3
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {function} xSelector - The selector from data array for x dimension
 * @param {function} ySelector - The selector for data array y dimension
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
    this.updateElements(this.elements);
  }

  xExtent(data) {
    return d3.extent(data.map(this.xSelector));
  }

  yExtent(data) {
    return [0, d3.max(data.map(this.ySelector))];
  }

  updateScales(xExtent, yExtent) {
    this.xScale.domain(xExtent);
    this.yScale.domain(yExtent);
    this.yScaleReverse.domain(yExtent);
  }

  updateElements() {
    console.error('>> ScalesDiagram: method "updateElements" should to be overridden');
  }

  draw(data) {
    const xExtent = this.xExtent(data);
    const yExtent = this.yExtent(data);
    this.updateScales(xExtent, yExtent);
  }
}

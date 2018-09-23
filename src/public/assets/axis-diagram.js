/* global Margin, ScalesDiagram */

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
   * @param {function} xSelector - The selector from data array for x dimension
   * @param {function} ySelector - The selector for data array y dimension
   */
  constructor(selector, margin, xSelector, ySelector) {
    super(selector, margin, xSelector, ySelector);

    this.xAxisGroup = null;
    this.yAxisGroup = null;
    this.initAxis();

    this.xLabelElement = this.createXLabel();
    this.yLabelElement = this.createYLabel();
  }

  handleResize() {
    super.handleResize();
    this.resizeAxis();
    this.resizeXLabel();
    this.resizeYLabel();
  }

  getXAxis() {
    return d3.axisBottom(this.xScale);
  }

  getYAxis() {
    return d3.axisLeft(this.yScaleReverse);
  }

  initAxis() {
    this.xAxisGroup = this.diagram.append('g');
    this.yAxisGroup = this.diagram.append('g');
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

  resizeXAxis() {}

  resizeAxis() {
    this.xScale.range([0, this.width]);
    this.yScale.range([0, this.height]);
    this.yScaleReverse.range([this.height, 0]);
    const xAxis = this.getXAxis();
    const yAxis = this.getYAxis();
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${this.height})`);
    this.yAxisGroup.call(yAxis);
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

  createXLabel() {
    return this.diagram
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px');
  }

  resizeXLabel() {
    this.xLabelElement.attr('x', this.width / 2).attr('y', this.height + 60);
  }

  set xLabel(text) {
    return this.xLabelElement.text(text);
  }

  createYLabel() {
    return this.diagram
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -this.height / 2)
      .attr('y', -60)
      .attr('font-size', '20px')
      .attr('transform', 'rotate(-90)');
  }

  resizeYLabel() {
    this.yLabelElement.attr('x', -this.height / 2);
  }

  set yLabel(text) {
    return this.yLabelElement.text(text);
  }
}

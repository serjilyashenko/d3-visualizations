/**
 * Class representing Axis for Dependency Injection into chart classes
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {Object} diagram - A svgCanvas d3 wrapped of the Chart
 * @param {Object} scales - A set of scales
 */
class Axis {
  constructor(diagram, getScales) {
    this.diagram = diagram;
    this.getScales = getScales;
    this.xAxisGroup = null;
    this.yAxisGroup = null;
    this.initAxis();

    this.xLabelElement = this.createXLabel();
    this.yLabelElement = this.createYLabel();
  }

  get width() {
    return this.getScales().width;
  }

  get height() {
    return this.getScales().height;
  }

  handleResize() {
    this.resizeAxis();
    this.resizeXLabel();
    this.resizeYLabel();
  }

  getXAxis() {
    return d3.axisBottom(this.getScales().xScale);
  }

  getYAxis() {
    return d3.axisLeft(this.getScales().yScaleReverse);
  }

  initAxis() {
    const diagram = this.diagram;
    this.xAxisGroup = diagram.append('g');
    this.yAxisGroup = diagram.append('g');
    const xAxis = this.getXAxis().ticks(0);
    const yAxis = this.getYAxis().ticks(0);
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${this.height})`);
    this.yAxisGroup
      .call(yAxis)
      .selectAll('text')
      .attr('opacity', 0);
  }

  resizeXAxis() {}

  resizeAxis() {
    const { height } = this.getScales();
    const xAxis = this.getXAxis();
    const yAxis = this.getYAxis();
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${height})`);
    this.yAxisGroup.call(yAxis);
  }

  firstUpdateXAxis(t) {
    const xAxis = this.getXAxis();
    this.xAxisGroup
      .call(xAxis)
      .selectAll('text')
      .attr('opacity', 0);
    this.updateXAxis(t);
  }

  updateXAxis(transition) {
    const xAxis = this.getXAxis();
    return this.xAxisGroup
      .transition(transition)
      .call(xAxis)
      .selectAll('text')
      .attr('opacity', 1);
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
    const { width, height } = this.getScales();
    return this.diagram
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height + 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px');
  }

  resizeXLabel() {
    const { width, height } = this.getScales();
    this.xLabelElement.attr('x', width / 2).attr('y', height + 60);
  }

  set xLabel(text) {
    return this.xLabelElement.text(text);
  }

  createYLabel() {
    const { height } = this.getScales();
    return this.diagram
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('font-size', '20px')
      .attr('transform', 'rotate(-90)');
  }

  resizeYLabel() {
    const { height } = this.getScales();
    this.yLabelElement.attr('x', -height / 2);
  }

  set yLabel(text) {
    return this.yLabelElement.text(text);
  }
}

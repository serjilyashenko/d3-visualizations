/**
 * Class representing Axis for Dependency Injection into chart classes
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {Object} Chart - One of charts
 */
class Axis {
  constructor(chart) {
    this.chart = chart;
    this.xAxisGroup = null;
    this.yAxisGroup = null;
    this.initAxis();

    this.xLabelElement = this.createXLabel();
    this.yLabelElement = this.createYLabel();
  }

  get width() {
    return this.chart.width;
  }

  get height() {
    return this.chart.height;
  }

  handleResize() {
    this.resizeAxis();
    this.resizeXLabel();
    this.resizeYLabel();
  }

  getXAxis() {
    return d3.axisBottom(this.chart.xScale);
  }

  getYAxis() {
    return d3.axisLeft(this.chart.yScaleReverse);
  }

  initAxis() {
    const diagram = this.chart.diagram;
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
    const xAxis = this.getXAxis();
    const yAxis = this.getYAxis();
    this.xAxisGroup.call(xAxis).attr('transform', `translate(0, ${this.height})`);
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
    return this.chart.diagram
      .append('text')
      .attr('class', 'x-axis-label')
      .attr('x', this.width / 2)
      .attr('y', this.height + 60)
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
    return this.chart.diagram
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

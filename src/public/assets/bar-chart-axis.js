/* global d3, Axis */

/**
 * Class representing Axis for Dependency Injection into BarChart classes
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {Object} Chart - One of charts
 */
class BarChartAxis extends Axis {
  getYAxis() {
    return super.getYAxis().tickFormat(d => `$${d}`);
  }

  set xLabel(text) {
    this.xLabelElement
      .attr('opacity', 0)
      .text(text)
      .transition()
      .duration(500)
      .delay(200)
      .attr('opacity', 1);
  }

  set yLabel(text) {
    this.yLabelElement
      .attr('opacity', 0)
      .text(text)
      .transition()
      .duration(500)
      .delay(200)
      .attr('opacity', 1);
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
}

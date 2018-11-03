/* global d3, AxisDiagram */

/**
 * Class representing Line-Chart diagram with Axis
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} selector - The css selector
 * @param {Margin} margin - The instance of the Margin class
 * @param {function} xSelector - The selector from data array for x dimension
 * @param {function} ySelector - The selector for data array y dimension
 */
class LineChart extends AxisDiagram {
  initScales() {
    super.initScales();
    this.xScale = d3.scaleTime().range([0, this.width]);
  }

  createElements(elements) {
    const line = d3
      .line()
      .x(d => this.xScale(this.xSelector(d)))
      .y(() => this.height);
    return elements.attr('d', line(this.data));
  }

  updateElements(elements) {
    const line = d3
      .line()
      .x(d => this.xScale(this.xSelector(d)))
      .y(d => this.yScaleReverse(this.ySelector(d)));
    return elements.attr('d', line(this.data));
  }

  firstDraw(data) {
    const t = d3.transition().duration(700);
    this.firstUpdateXAxis(t);
    this.firstUpdateYAxis(t);
    this.updateElements(
      this.elements
        .transition()
        .duration(700)
        .delay(700),
      data
    );
  }

  draw(data) {
    super.draw(data);

    this.data = data;
    const elements = this.diagram
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5);
    const newElements = this.createElements(elements);

    // if (!this.elements) {
    this.elements = newElements;
    this.firstDraw(data);
    // } else {
    //   this.elements = newElements.merge(elements);
    //   this.updateDraw(elements);
    // }
  }
}

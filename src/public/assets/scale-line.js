/* global d3, ScalesDiagram */

/**
 * Class representing Scale-Line diagram with Axis
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} selector - The css selector
 * @param {Margin} margin - The instance of the Margin class
 * @param {function} xSelector - The selector from data array for x dimension
 * @param {function} ySelector - The selector for data array y dimension
 */
class ScaleLine extends ScalesDiagram {
  setWidth(width) {
    this.lineWidth = width;
  }

  initScales() {
    super.initScales();
    this.xScale = d3.scaleTime().range([0, this.width]);
  }

  handleTouchStart() {
    d3.event.preventDefault();
  }

  createElements(lineElement) {
    this.line = d3
      .line()
      .x(d => this.xScale(this.xSelector(d)))
      .y(() => this.height);
    return lineElement.attr('d', this.line(this.data));
  }

  updateElements() {
    const t = d3.transition().duration(700);
    this.lineElement.transition().attr('d', this.line(this.data));
  }

  firstDraw() {
    this.line.y(d => this.yScaleReverse(this.ySelector(d)));
    this.lineElement.transition().attr('d', this.line(this.data));
  }

  draw(data) {
    const strokeColor = this.strokeColor || '#118c11ab';
    super.draw(data);

    this.data = data;
    const lineWidth = this.lineWidth || 1;
    const lineElement = this.diagram
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', lineWidth);

    if (!this.lineElement) {
      const newElement = this.createElements(lineElement);
      this.lineElement = newElement;
      this.firstDraw(data);
    } else {
      this.updateElements();
    }
  }
}

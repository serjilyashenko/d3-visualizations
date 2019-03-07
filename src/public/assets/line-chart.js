/* global d3, ScalesDiagram, Axis, LineChartPointer */

/**
 * Class representing Line-Chart diagram with Axis
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} selector - The css selector
 * @param {Margin} margin - The instance of the Margin class
 * @param {function} xSelector - The selector from data array for x dimension
 * @param {function} ySelector - The selector for data array y dimension
 */
class LineChart extends ScalesDiagram {
  constructor(selector, margin, ...rest) {
    super(selector, margin, ...rest);

    const getScales = () => ({
      selector: this.selector,
      width: this.width,
      height: this.height,
      xSelector: this.xSelector,
      ySelector: this.ySelector,
      xScale: this.xScale,
      yScaleReverse: this.yScaleReverse
    });
    const getData = () => this.data || null;

    this.axis = new Axis(this.diagram, getScales);
    this.pointer = new LineChartPointer(this.diagram, margin, getScales, getData);
  }

  initScales() {
    super.initScales();
    this.xScale = d3.scaleTime().range([0, this.width]);
  }

  handleResize(...attrs) {
    super.handleResize(...attrs);
    this.pointer.handleResize();
  }

  createElements(elements) {
    this.line = d3
      .line()
      .x(d => this.xScale(this.xSelector(d)))
      .y(() => this.height);
    return elements.attr('d', this.line(this.data));
  }

  updateElements(noTransition) {
    const t = d3.transition(0).duration(700);
    let elements = this.elements;
    this.axis.updateXAxis(t);
    this.axis.updateYAxis(t);

    if (!noTransition) {
      elements = elements.transition();
    }

    elements.attr('d', this.line(this.data));
  }

  firstDraw() {
    this.line.y(d => this.yScaleReverse(this.ySelector(d)));

    const t = d3.transition().duration(700);
    this.axis.firstUpdateXAxis(t);
    this.axis.firstUpdateYAxis(t);

    this.elements
      .transition()
      .duration(700)
      .delay(700)
      .attr('d', this.line(this.data));
  }

  draw(data, noTransition) {
    super.draw(data);

    this.data = data;
    const elements = this.diagram
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#118c11ab')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5);

    if (!this.elements) {
      const newElements = this.createElements(elements);
      this.elements = newElements;
      this.firstDraw(data);
    } else {
      this.updateElements(noTransition);
    }
  }
}

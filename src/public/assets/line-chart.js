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
  constructor(...args) {
    super(...args);

    this.hideFocus = this.hideFocus.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);

    this.bisectDate = d3.bisector(this.xSelector).left;
    this.initTooltip();
  }

  initScales() {
    super.initScales();
    this.xScale = d3.scaleTime().range([0, this.width]);
  }

  handleResize(...attrs) {
    super.handleResize(...attrs);
    this.focus
      .select('line')
      .attr('x1', 0)
      .attr('y1', this.height)
      .attr('visibility', 'hidden');
  }

  initTooltip() {
    this.diagram
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('touchmove', this.handlePointerMove)
      .on('touchstart', this.handleTouchStart)
      .on('mousemove', this.handlePointerMove)
      .on('mouseout', this.hideFocus);

    this.focus = this.diagram.append('g');
    this.focus
      .append('line')
      .attr('x1', 0)
      .attr('y1', this.height)
      .attr('visibility', 'hidden')
      .attr('stroke', 'red');
    this.focus
      .append('text')
      .attr('y', 100)
      .attr('x', 15)
      .attr('dy', '.31em');
  }

  handleTouchStart() {
    d3.event.preventDefault();
  }

  handlePointerMove(a1, a2, [rect]) {
    const [xCoord] = d3.mouse(rect);

    if (xCoord > rect.getBoundingClientRect().width) {
      return;
    }

    const x = this.xScale.invert(xCoord);
    const i = this.bisectDate(this.data, x, 1);
    const d = this.data[i];
    this.setFocus(d);
  }

  hideFocus() {
    this.focus.select('line').attr('visibility', 'hidden');
  }

  setFocus(d) {
    const x = this.xScale(this.xSelector(d));
    const y = this.yScaleReverse(this.ySelector(d));

    this.focus
      .select('line')
      .attr('visibility', 'visible')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y2', y);

    this.focus
      .select('text')
      .attr('x', x)

      .attr('text-anchor', 'end')
      .text(this.ySelector(d));
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

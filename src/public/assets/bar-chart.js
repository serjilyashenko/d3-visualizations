/* global d3, ScalesDiagram, BarChartAxis */

/**
 * Class representing Bar-Chart diagram with Axis
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} selector - The css selector
 * @param {Margin} margin - The instance of the Margin class
 * @param {function} xSelector - The selector from data array for x dimension
 * @param {function} ySelector - The selector for data array y dimension
 */
class BarChart extends ScalesDiagram {
  constructor(selector, margin, xSelector, ySelector) {
    super(selector, margin, xSelector, ySelector);

    this.axis = new BarChartAxis(this);
  }

  handleResize() {
    super.handleResize();
    this.axis.handleResize();
  }

  initScales() {
    super.initScales();
    this.xScale.paddingOuter(0.3).paddingInner(0.3);
  }

  xExtent(data) {
    // Use months on x-axis (array of strings)
    return data.map(this.xSelector);
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

  firstDraw() {
    const t = d3.transition().duration(700);
    this.axis.updateXAxis(t);
    this.axis.firstUpdateYAxis(t);
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
    this.axis.updateYAxis(t2);
    this.secondUpdate(elements.transition(t2));

    const t3 = d3
      .transition()
      .duration(200)
      .delay(800);
    this.axis.updateXAxis(t3);
    this.thirdUpdate(elements, t3);

    const t4 = d3
      .transition()
      .duration(400)
      .delay(1000);
    this.updateElements(this.elements.transition(t4));
  }

  set xLabel(text) {
    this.axis.xLabel = text;
  }

  set yLabel(text) {
    this.axis.yLabel = text;
  }

  draw(data) {
    super.draw(data);

    const elements = this.diagram.selectAll('rect').data(data, this.xSelector);
    const newElements = this.createElements(elements);

    if (!this.elements) {
      this.elements = newElements;
      this.firstDraw();
    } else {
      this.elements = newElements.merge(elements);
      this.updateDraw(elements);
    }
  }
}

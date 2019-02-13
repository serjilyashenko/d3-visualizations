/* global d3 */

const RIGHT_OFFSET = { top: -12, left: 13 };

/**
 * Class representing Tooltip for Charts
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {string} chartAreaSelector - A svgCanvas d3 wrapped of the Chart
 * @param {Margin} margin - The instance of the Margin class
 */
class Tooltip {
  constructor(chartAreaSelector, margin) {
    this.margin = margin;
    this.offset = RIGHT_OFFSET;
    this.tooltip = d3
      .select(chartAreaSelector)
      .append('div')
      .attr('class', 'tooltip tooltip_left')
      .style('opacity', 0);

    this.width = null;
    this._renderContent();
  }

  setLeftPosition() {
    this.offset = Object.assign({}, RIGHT_OFFSET, { left: -this.width - 13 });
    this.tooltip.classed('tooltip_left', true);
    return this;
  }

  setRightPosition() {
    this.offset = RIGHT_OFFSET;
    this.tooltip.classed('tooltip_left', false);
    return this;
  }

  render(left, top, innerHTML) {
    this._renderContent(innerHTML);
    this.tooltip
      .style('left', `${left + this.margin.left + this.offset.left}px`)
      .style('top', `${top + this.margin.top + this.offset.top}px`)
      .transition(d3.transition().duration(100))
      .style('opacity', 1);

    return this;
  }

  remove() {
    this.tooltip.transition(d3.transition().duration(100)).style('opacity', 0);
    return this;
  }

  _renderContent(innerHTML) {
    this.tooltip.html(innerHTML);
    this.width = this.tooltip.node().getBoundingClientRect().width;
  }
}

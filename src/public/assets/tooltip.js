/* global d3 */

const RIGHT_OFFSET = { top: -12, left: 13 };

class Tooltip {
  constructor(selector, margin) {
    this.margin = margin;
    this.offset = RIGHT_OFFSET;
    this.tooltip = d3
      .select(selector)
      .append('div')
      .attr('class', 'tooltip tooltip_left');

    this.width = null;
    this.renderContent();
  }

  setLeftPosition() {
    this.offset = { ...RIGHT_OFFSET, left: -this.width - 13 };
    this.tooltip.classed('tooltip_left', true);
    return this;
  }

  setRightPosition() {
    this.offset = RIGHT_OFFSET;
    this.tooltip.classed('tooltip_left', false);
    return this;
  }

  renderContent(innerHTML) {
    this.tooltip.html(innerHTML);
    this.width = this.tooltip.node().getBoundingClientRect().width;
  }

  render(left, top, innerHTML) {
    this.renderContent(innerHTML);
    this.tooltip
      .style('left', `${left + this.margin.left + this.offset.left}px`)
      .style('top', `${top + this.margin.top + this.offset.top}px`)
      .transition(d3.transition().duration(100))
      .style('opacity', 1);

    return this;
  }
}

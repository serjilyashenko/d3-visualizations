/* global d3, Tooltip */

class Circle {
  constructor(fill, r) {
    this.fill = fill;
    this.r = r;
  }
}

/**
 * Class representing Pointer for Line Charts
 * @author Serj Ilyashenko <serj.ilaysenko@gmail.com>
 * @param {Object} diagram - A svgCanvas d3 wrapped of the Chart
 * @param {Object} scales - A set of scales
 * @param {string} selector - The css selector
 * @param {Margin} margin - The instance of the Margin class
 */
class LineChartPointer {
  constructor(diagram, margin, getScales, getData) {
    this.diagram = diagram;
    this.getScales = getScales;
    this.getData = getData || (() => null);

    const scales = this.getScales();
    this.tooltip = new Tooltip(scales.selector, margin);
    this.bisectDate = d3.bisector(scales.xSelector).left;
    this.strokeColor = '#118c11ab';

    this.hideFocus = this.hideFocus.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);

    this.initPointer();
  }

  initPointer() {
    const scales = this.getScales();
    this.eventRect = this.diagram.append('rect');
    this.eventRect
      .attr('width', scales.width)
      .attr('height', scales.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('touchmove', this.handlePointerMove)
      .on('touchstart', this.handleTouchStart)
      .on('mousemove', this.handlePointerMove)
      .on('mouseout', this.hideFocus);

    this.initFocus();
  }

  handleResize() {
    const scales = this.getScales();
    this.eventRect.attr('width', scales.width).attr('height', scales.height);
    this.hideFocus();
  }

  setStrokeColor(color) {
    this.strokeColor = color;
    this.initPointer();
  }

  initFocus() {
    const scales = this.getScales();
    this.focus = this.diagram.append('g');
    this.focus
      .append('line')
      .style('pointer-events', 'none')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', scales.height)
      .style('display', 'none')
      .attr('stroke', '#333');
    this.focus
      .append('text')
      .attr('y', 100)
      .attr('x', 15)
      .attr('dy', '.31em')
      .style('display', 'none');
    const circles = [new Circle(this.strokeColor, 7), new Circle('white', 5), new Circle(this.strokeColor, 4)];
    this.focus
      .selectAll('circle')
      .data(circles)
      .enter()
      .append('circle')
      .style('display', 'none')
      .style('pointer-events', 'none')
      .attr('fill', d => d.fill)
      .attr('r', d => d.r);
  }

  setFocus(d) {
    const scales = this.getScales();
    const x = scales.xScale(scales.xSelector(d));
    const y = scales.yScaleReverse(scales.ySelector(d));

    const tooltipData = {
      x,
      y,
      value: scales.ySelector(d),
      dateObj: scales.xSelector(d)
    };
    this.showTooltip(tooltipData);

    this.focus
      .select('line')
      .style('display', null)
      .attr('x1', x)
      .attr('x2', x);
    this.focus
      .selectAll('circle')
      .style('display', null)
      .attr('cx', x)
      .attr('cy', y);
  }

  hideFocus() {
    this.focus.select('line').style('display', 'none');
    this.focus.selectAll('circle').style('display', 'none');
    this.tooltip.remove();
  }

  renderTooltipText(value) {
    return `<div>1BTC = <span class="label">${value}$</div>`;
  }

  showTooltip({ x, y, value, dateObj }) {
    const date = dateObj.getDate();
    const month = dateObj.toLocaleString('en-us', { month: 'short' });
    const year = dateObj.getFullYear();
    const tooltipText = this.renderTooltipText(value);
    const tooltipHTML = `
    <div class="content">
      <div><b>${date} ${month} ${year}</b></div>
      ${tooltipText}
    </span></div>
    `;
    this.tooltip.setLeftPosition().render(x, y, tooltipHTML);
  }

  handleTouchStart() {
    d3.event.preventDefault();
  }

  handlePointerMove(a1, a2, [rect]) {
    const [xCoord] = d3.mouse(rect);
    const outArea = xCoord > rect.getBoundingClientRect().width;
    const data = this.getData();

    if (outArea || !data) {
      return;
    }

    const x = this.getScales().xScale.invert(xCoord);
    const i = this.bisectDate(data, x, 1);
    const d = data[i];
    this.setFocus(d);
  }
}

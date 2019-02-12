/* global d3, ScalesDiagram */

class Circle {
  constructor(fill, r) {
    this.fill = fill;
    this.r = r;
  }
}

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

    this.axis = new Axis(this);

    this.tooltip = new Tooltip(selector, margin);
    this.bisectDate = d3.bisector(this.xSelector).left;

    this.hideFocus = this.hideFocus.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  initScales() {
    super.initScales();
    this.xScale = d3.scaleTime().range([0, this.width]);
  }

  handleResize(...attrs) {
    super.handleResize(...attrs);
    this.eventRect.attr('width', this.width).attr('height', this.height);
    this.focus
      .select('line')
      .attr('y2', this.height)
      .attr('visibility', 'hidden');
  }

  initTooltip() {
    this.eventRect = this.diagram.append('rect');

    this.eventRect
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('touchmove', this.handlePointerMove)
      .on('touchstart', this.handleTouchStart)
      .on('mousemove', this.handlePointerMove)
      .on('mouseout', this.hideFocus);

    this.initFocus();
  }

  showTooltip({ x, y, btcRate, dateObj }) {
    const date = dateObj.getDate();
    const month = dateObj.toLocaleString('en-us', { month: 'short' });
    const year = dateObj.getFullYear();
    const tooltipHTML = `
    <div class="content">
      <div><b>${date} ${month} ${year}</b></div>
      <div>1BTC = <span class="label">${btcRate}$</div>
    </span></div>
    `;
    this.tooltip.setLeftPosition().render(x, y, tooltipHTML);
  }

  initFocus() {
    this.focus = this.diagram.append('g');
    this.focus
      .append('line')
      .style('pointer-events', 'none')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', this.height)
      .style('display', 'none')
      .attr('stroke', '#333');
    this.focus
      .append('text')
      .attr('y', 100)
      .attr('x', 15)
      .attr('dy', '.31em')
      .style('display', 'none');
    const circles = [new Circle('#00800080', 7), new Circle('white', 5), new Circle('green', 4)];
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
    this.focus.select('line').style('display', 'none');
    this.focus.selectAll('circle').style('display', 'none');
  }

  setFocus(d) {
    const x = this.xScale(this.xSelector(d));
    const y = this.yScaleReverse(this.ySelector(d));

    const tooltipData = {
      x,
      y,
      btcRate: this.ySelector(d),
      dateObj: new Date(d.key)
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

  createElements(elements) {
    this.line = d3
      .line()
      .x(d => this.xScale(this.xSelector(d)))
      .y(() => this.height);
    return elements.attr('d', this.line(this.data));
  }

  updateElements(elements) {
    const t = d3.transition().duration(700);
    this.axis.updateXAxis(t);
    this.axis.updateYAxis(t);
    this.elements.transition().attr('d', this.line(this.data));
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

  draw(data) {
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
      this.initTooltip();
    } else {
      this.updateElements();
      this.hideFocus();
    }
  }
}

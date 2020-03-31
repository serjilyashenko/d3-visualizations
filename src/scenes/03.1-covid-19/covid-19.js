/* global d3, Margin, LineChart, ScaleLine */

(async function() {

  // D3 Diagrams
  const sliderLineMargin = new Margin(1, 0, 1, 0);
  const diagramMargin = new Margin(30, 10, 20, 40);
  const sliderDiagram = new ScaleLine('#chart-slider-area', sliderLineMargin, d => new Date(d[0]), d => d[1]);
  sliderDiagram.strokeColor = 'grey';
  const diagram = new LineChart('#covid-19-chart-area', diagramMargin, d => new Date(d[0]), d => d[1]);
  diagram.setStrokeColor('red');
  diagram.pointer.renderTooltipText = value => `<div><span class="label">${value}</span> cases</div>`;

  let activeRange;

  // The Double Slider initialization
  const dSlider = new DoubleSlider('d-slider', 0, 0, 3);
  dSlider.disable();
  dSlider.onChange((lowPosition, highPosition) => {
    const selectedRange = allRange.slice(lowPosition, highPosition);
    diagram.draw(selectedRange, true);
  });

  // Range Buttons initialization
  const rangeButtons = Array.prototype.slice.apply(document.querySelectorAll('.range-button'));
  rangeButtons.forEach(rb => {
    const range = rb.getAttribute('range');
    rb.addEventListener('click', () => {
      if (!allRange) {
        return;
      }
      const selectedRange = range ? allRange.slice(-1 * range) : allRange;
      dSlider.setPositionRange(allRange.length - selectedRange.length, allRange.length);
      diagram.draw(selectedRange);
    });
  });

  document.querySelector('.spinner').style.opacity = 1;

  const rawData = await d3.json('https://corona.lmao.ninja/v2/historical');
  const aggregated = rawData
    .map(({ timeline }) => timeline.cases)
    .reduce((res, countryCases) => {
      Object
        .entries(countryCases)
        .forEach(([date, cases]) => {
          const prev = res[date] || 0;
          res[date] = prev + cases;
        });
      return res;
    }, {});

  document.querySelector('.spinner').style.opacity = 0;

  const allRange = Object.entries(aggregated);

  activeRange = allRange.slice(-1 * 180);

  dSlider.setMaxPositionRange(0, allRange.length);
  dSlider.setPositionRange(allRange.length - activeRange.length, allRange.length);
  dSlider.enable();

  sliderDiagram.draw(allRange);
  diagram.draw(activeRange);
})();

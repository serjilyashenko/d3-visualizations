/* global d3, Margin, LineChart, ScaleLine */

(async function() {
  const startDate = '2013-09-01';
  const endDate = d3.timeFormat('%Y-%m-%d')(new Date());
  const timeFormat = d3.timeFormat('%d %b %Y, %H:%M %p');

  const currencies = [
    {
      name: 'BTC',
      fetchRate: async () => {
        const rawData = await d3.json('https://api.coindesk.com/v1/bpi/currentprice.json');
        const date = timeFormat(new Date(rawData.time.updatedISO));
        const rate = rawData.bpi.USD.rate;
        return { date, rate };
      },
      fetchData: async () => {
        const btcURL = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`;
        const rawData = await d3.json(btcURL);
        return d3.map(rawData.bpi).entries();
      }
    },
    {
      name: 'EUR',
      rateUrl: 'https://api.exchangeratesapi.io/latest',
      getDate: d => d.date,
      getRate: d => d.rates.USD,
      fetchRate: async () => {
        const rawData = await d3.json('https://api.exchangeratesapi.io/latest');
        const date = timeFormat(new Date(rawData.date));
        const rate = rawData.rates.USD;
        return { date, rate };
      },
      fetchData: async () => {
        const eurURL = `https://api.exchangeratesapi.io/history?start_at=${startDate}&end_at=${endDate}&symbols=USD`;
        const eurData = await d3.json(eurURL);
        return d3
          .map(eurData.rates)
          .entries()
          .map(it => Object.assign({}, it, { value: it.value.USD }))
          .sort((a, b) => (a.key > b.key ? 1 : -1));
      }
    }
  ];

  // D3 Diagrams
  const sliderLineMargin = new Margin(1, 0, 1, 0);
  const diagramMargin = new Margin(30, 10, 20, 40);
  const sliderDiagram = new ScaleLine('#chart-slider-area', sliderLineMargin, d => new Date(d.key), d => d.value);
  const diagram = new LineChart('#coin-stars-chart-area', diagramMargin, d => new Date(d.key), d => d.value);

  // Active Currency section
  const selector = document.getElementById('currency-selector');
  for (let [index, curr] of currencies.entries()) {
    const { date, rate } = await curr.fetchRate();
    const optionHTML = `1${curr.name} = ${rate}$ (for ${date})`;
    const option = document.createElement('option');
    option.innerHTML = optionHTML;
    option.setAttribute('value', curr.name);
    selector.appendChild(option);
  }

  const cache = {};
  let allRange;
  let activeRange;

  // The Double Slider initialization
  const dSlider = new DoubleSlider('d-slider', 0, 0, 30);
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

  // Apply selected currency
  async function setCurrency(value) {
    if (!cache[value]) {
      document.querySelector('.spinner').style.opacity = 1;
      cache[value] = await currencies.find(curr => curr.name === value).fetchData();
      document.querySelector('.spinner').style.opacity = 0;
    }
    allRange = cache[value];
    activeRange = allRange.slice(-1 * 180);

    dSlider.setMaxPositionRange(0, allRange.length);
    dSlider.setPositionRange(allRange.length - activeRange.length, allRange.length);
    dSlider.enable();

    sliderDiagram.draw(allRange);
    diagram.draw(activeRange);
  }

  selector.addEventListener('change', () => {
    setCurrency(selector.value);
    analytics.track(`Change Currency to ${selector.value}`, {
      title: 'Change Currency',
      course: 'Intro to Analytics',
    });
  });
  setCurrency(currencies[0].name);
})();

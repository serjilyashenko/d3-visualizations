(async function() {
  const MAX_WIDTH = 1200;
  const SCALE_IND = 6.2;
  const HEIGHT_IND = 1.5;

  const container = d3.select('.container.container_main .main-content');
  const width = container.node().getBoundingClientRect().width;
  const height = width / HEIGHT_IND;
  const scale = width / MAX_WIDTH;

  const projection = d3
    .geoMercator()
    // .geoConicEqualArea()
    // .geoGilbert()
    // .geoAiry()
    // .geoAitoff()
    .scale(width / SCALE_IND)
    .translate([width / 2, height / 2])
    .precision(0.1);

  const path = d3.geoPath().projection(projection);

  const graticule = d3.geoGraticule();

  const svg = container
    .append('svg')
    .style('padding-top', 20)
    .attr('width', '100%')
    .attr('height', height);

  const grid = svg
    .append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', path);

  const [world, countryNames] = await Promise.all([
    d3.json('world-110m.v1.json'),
    d3.tsv('world-110m-country-names.tsv', 'tsv')
  ]);

  const countryMap = countryNames.reduce((res, country) => ({ ...res, [country.id]: country.name }), {});
  const countries = topojson
    .feature(world, world.objects.countries)
    .features.map(d => ({ ...d, name: countryMap[Number(d.id)] }));

  document.querySelector('.spinner').style.opacity = 0;

  let selectedId = null;

  const boundary = svg
    .append('g')
    .selectAll('path')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', 'boundary')
    .attr('d', path)
    .attr('stroke', '#fff')
    .attr('stroke-width', '.5px')
    .on('click', d => {
      selectedId = d.id;
      document.querySelector('.country-name').innerHTML = ` - ${d.name}`;
      onRedrawBoundary();
    });

  const onRedrawBoundary = () => {
    boundary.attr('fill', d => {
      if (d.id === selectedId) {
        console.log('>> ', d.id, d.name);
        return 'green';
      }
      return '#999';
    });
  };

  onRedrawBoundary();

  const onResize = () => {
    const width = container.node().getBoundingClientRect().width;
    const height = width / HEIGHT_IND;

    const newProjection = projection.scale(width / SCALE_IND).translate([width / 2, height / 2]);
    const newPath = d3.geoPath().projection(newProjection);

    svg.attr('height', height);
    grid.attr('d', newPath);
    // land.attr('d', newPath);
    boundary.attr('d', newPath);
  };

  window.addEventListener('resize', onResize);
})();

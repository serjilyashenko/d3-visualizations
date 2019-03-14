setTimeout(() => (document.querySelector('.spinner').style.opacity = 0), 1000);

(function() {
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

  d3.json('world-110m.v1.json', function(error, world) {
    if (error) throw error;

    const land = svg
      .append('path')
      .datum(topojson.feature(world, world.objects.land))
      .attr('class', 'land')
      .attr('d', path);

    const boundary = svg
      .append('path')
      .datum(topojson.mesh(world, world.objects.countries), (a, b) => a !== b)
      .attr('class', 'boundary')
      .attr('d', path);

    const onResize = () => {
      const width = container.node().getBoundingClientRect().width;
      const height = width / HEIGHT_IND;

      const newProjection = projection.scale(width / SCALE_IND).translate([width / 2, height / 2]);
      const newPath = d3.geoPath().projection(newProjection);

      svg.attr('height', height);
      grid.attr('d', newPath);
      land.attr('d', newPath);
      boundary.attr('d', newPath);
    };

    window.addEventListener('resize', onResize);
  });
})();

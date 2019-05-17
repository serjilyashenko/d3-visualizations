(function() {
  const fetchPolyfill = oldFetch => fileName =>
    new Promise((resolve, reject) => {
      oldFetch(fileName, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

  if (!d3.json.then) {
    const oldJson = d3.json.bind(d3);
    d3.json = fetchPolyfill(oldJson);
  }

  if (!d3.tsv.then) {
    const oldTsv = d3.tsv.bind(d3);
    d3.tsv = fetchPolyfill(oldTsv);
  }
})();

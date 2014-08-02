(function() {
  var ComicReader, _scrapers;

  _scrapers = {};

  ComicReader = {
    register: function(code, scraper) {
      return _scrapers[code] = scraper;
    },
    scraper: function(code) {
      return _scrapers[code];
    }
  };

  module.exports = ComicReader;

}).call(this);

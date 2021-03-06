(function() {
  var ComicLoader, _scrapers;

  _scrapers = {};

  ComicLoader = {
    register: function(code, scraper) {
      return _scrapers[code] = scraper;
    },
    scraper: function(code) {
      return _scrapers[code];
    }
  };

  module.exports = ComicLoader;

}).call(this);

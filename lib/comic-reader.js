(function() {
  var ComicReader;

  ComicReader = {
    scrapers: {},
    register: function(code, scraper) {
      return this.scrapers[code] = scraper;
    },
    scraper: function(code) {
      return this.scrapers[code];
    }
  };

  module.exports = ComicReader;

}).call(this);

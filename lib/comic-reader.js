(function() {
  var ComicReader;

  ComicReader = module.exports = ComicReader;

}).call(this);

(function() {
  var SFScraper, phridge;

  phridge = require('phridge');

  SFScraper = (function() {
    function SFScraper() {}

    SFScraper.issue = function(url, callback) {
      return phridge.spawn().then(function(phantom) {
        return phantom.openPage("http://example.com").then(function(page) {
          url = page.evaluate(function() {
            return document.querySelector("#curPic").src;
          });
          return resolve(url);
        });
      }).then(function(url) {
        return console.log("image url: ", url);
      });
    };

    return SFScraper;

  })();

}).call(this);

(function() {
  var ComicReader, SFScraper, phridge;

  phridge = require('phridge');

  ComicReader = require('../comic-reader');

  SFScraper = {
    code: "sf",
    issue: function(url, success, failure) {
      return phridge.spawn().then(function(phantom) {
        return phantom.openPage(url);
      }).then(function(page) {
        return page.run(function() {
          return this.evaluate(function() {
            var images;
            images = [];
            while (curIndex < picCount) {
              images.push(document.querySelector("#curPic").src);
              NextPage();
            }
            return images;
          });
        });
      })["finally"](phridge.disposeAll).done(success, failure);
    }
  };

  ComicReader.register(SFScraper.code, SFScraper);

  module.exports = SFScraper;

}).call(this);

(function() {
  var ComicReader, SFScraper, phridge;

  phridge = require('phridge');

  ComicReader = require('../comic-reader');

  SFScraper = {
    code: "sf",
    issue: function(url, success, failure) {
      return phridge.spawn({
        loadImages: false
      }).then(function(phantom) {
        return phantom.openPage(url);
      }).then(function(page) {
        return page.run(function() {
          return this.evaluate(function() {
            var image, images;
            images = [];
            while (true) {
              image = document.querySelector("#curPic").src;
              if (!image || images.indexOf(image) > -1) {
                break;
              } else {
                images.push(image);
                NextPage();
              }
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

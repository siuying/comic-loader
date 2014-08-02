(function() {
  var ComicReader, SFScraper, cheerio, phridge, request;

  phridge = require('phridge');

  request = require('request');

  cheerio = require('cheerio');

  ComicReader = require('../comic-reader');

  SFScraper = {
    code: "sf",
    search: function(keyword, success, failure) {
      var encodedKeyword, url;
      encodedKeyword = encodeURI(keyword);
      url = "http://s.sfacg.com/?Key=" + encodedKeyword + "&S=&SS=";
      return request(url, function(error, response, body) {
        var $, results, row;
        if (!error && response.statusCode === 200) {
          $ = cheerio.load(body);
          row = $("#form1 table").filter(function(i, elem) {
            return $(".Conjunction", elem).length > 0;
          }).first();
          results = $("ul", row).map(function(i, item) {
            var image, link, name, thumbnail;
            image = $("img", item);
            if (image) {
              thumbnail = image.attr('src');
            }
            link = $("a", item);
            if (link) {
              url = link.attr('href');
            }
            if (link) {
              name = link.text();
            }
            return {
              thumbnail: thumbnail,
              url: url,
              name: name
            };
          });
          return success(results);
        } else if (error) {
          return failure(error);
        } else {
          return failure(new Error("http error: " + response));
        }
      });
    },
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

(function() {
  var ComicReader, SFScraper, URI, USER_AGENT, cheerio, phridge, request;

  phridge = require('phridge');

  request = require('request');

  cheerio = require('cheerio');

  URI = require('URIjs');

  ComicReader = require('../comic-reader');

  USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0";

  SFScraper = {
    code: "sf",
    search: function(keyword, success, failure) {
      var encodedKeyword, options, url;
      encodedKeyword = encodeURI(keyword);
      url = "http://s.sfacg.com/?Key=" + encodedKeyword + "&S=&SS=";
      options = {
        url: url,
        headers: {
          'User-Agent': USER_AGENT
        }
      };
      return request(options, function(error, response, body) {
        var $, results, table;
        if (!error && response.statusCode === 200) {
          $ = cheerio.load(body);
          table = $("#form1 table").filter(function(i, elem) {
            return $(".Conjunction", elem).length > 0;
          }).first();
          results = $("ul", table).map(function(i, item) {
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
          return failure(new Error("http error: " + response + ", body: " + body));
        }
      });
    },
    list: function(url, success, failure) {
      var options;
      options = {
        url: url,
        headers: {
          'User-Agent': USER_AGENT
        }
      };
      return request(options, function(error, response, body) {
        var $, issues;
        if (!error && response.statusCode === 200) {
          issues = [];
          $ = cheerio.load(body);
          $("script").remove();
          $("table.base_line").first().parent("td").children().filter(function(i, elem) {
            return $(".serialise_list_bg1", elem).text().indexOf("正     篇") > -1;
          }).next().children("li").each(function(i, elem) {
            var issueName, issueUrl, link;
            link = $("a", elem);
            if (link) {
              issueUrl = URI(link.attr('href')).absoluteTo(url).toString();
              issueName = link.text();
              return issues.push({
                url: issueUrl,
                name: issueName
              });
            }
          });
          return success({
            issues: issues
          });
        } else if (error) {
          return failure(error);
        } else {
          return failure(new Error("http error " + response.statusCode + ": " + response + ", body: " + body));
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

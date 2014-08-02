(function() {
  var ComicReader, Promise, SFScraper, URI, USER_AGENT, cheerio, phridge, request, _, _extractDayComic;

  phridge = require('phridge');

  request = require('request');

  cheerio = require('cheerio');

  Promise = require('es6-promise').Promise;

  URI = require('URIjs');

  _ = require('lodash');

  ComicReader = require('../comic-reader');

  USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0";

  phridge.config.stdout = null;

  phridge.config.stderr = null;

  SFScraper = {
    code: "sf",
    recent: function() {
      return new Promise(function(resolve, reject) {
        var options, url;
        url = "http://comic.sfacg.com/WeeklyUpdate/";
        options = {
          url: url,
          headers: {
            'User-Agent': USER_AGENT
          }
        };
        return request(options, function(error, response, body) {
          var $, i, results;
          if (!error && response.statusCode === 200) {
            $ = cheerio.load(body);
            results = (function() {
              var _i, _results;
              _results = [];
              for (i = _i = 0; _i <= 7; i = ++_i) {
                _results.push(_extractDayComic($, "#Day" + i, "#Menu_" + i));
              }
              return _results;
            })();
            results = _.flatten(results);
            return resolve(results);
          } else if (error) {
            return reject(error);
          } else {
            return reject(new Error("http error: " + response + ", body: " + body));
          }
        });
      });
    },
    search: function(keyword) {
      return new Promise(function(resolve, reject) {
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
            return resolve(results);
          } else if (error) {
            return reject(error);
          } else {
            return reject(new Error("http error: " + response + ", body: " + body));
          }
        });
      });
    },
    issues: function(url) {
      return new Promise(function(resolve, reject) {
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
            return resolve({
              issues: issues
            });
          } else if (error) {
            return reject(error);
          } else {
            return reject(new Error("http error " + response.statusCode + ": " + response + ", body: " + body));
          }
        });
      });
    },
    pages: function(url, success, failure) {
      return new Promise(function(resolve, reject) {
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
        })["finally"](phridge.disposeAll).done(resolve, reject);
      });
    }
  };

  _extractDayComic = function($, comicQuery, titleQuery) {
    var date, items;
    items = [];
    date = $(titleQuery).text();
    $("" + comicQuery + " table table").each(function(index, item) {
      var image, issue, link, name, thumbnail, url;
      link = $("a", item);
      url = link != null ? link.attr('href') : void 0;
      image = $("img", item);
      thumbnail = image != null ? image.attr('src') : void 0;
      name = image != null ? image.attr('alt') : void 0;
      issue = $("tr:last-child > td", item).text();
      return items.push({
        group: date,
        name: name,
        issue: issue,
        thumbnail: thumbnail,
        url: url
      });
    });
    return items;
  };

  ComicReader.register(SFScraper.code, SFScraper);

  module.exports = SFScraper;

}).call(this);

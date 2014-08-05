(function() {
  var ComicLoader, Promise, SFScraper, URI, USER_AGENT, cheerio, request, _, _extractDayComic, _extractScript;

  request = require('request');

  cheerio = require('cheerio');

  Promise = require('es6-promise').Promise;

  URI = require('URIjs');

  _ = require('lodash');

  ComicLoader = require('../comic-loader');

  USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0";

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
            results = [];
            $("ul", table).each(function(i, item) {
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
              return results.push({
                thumbnail: thumbnail,
                url: url,
                name: name
              });
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
    pages: function(url) {
      console.log("pages", url);
      return new Promise(function(resolve, reject) {
        var options;
        options = {
          url: url,
          headers: {
            'User-Agent': USER_AGENT
          }
        };
        return request(options, function(error, response, body) {
          var $, fullScriptSource, scriptSource;
          if (!error && response.statusCode === 200) {
            $ = cheerio.load(body);
            scriptSource = $("script").filter(function(i, e) {
              var _ref;
              return ((_ref = $(e).attr('src')) != null ? _ref.match("^/Utility/.+/.+\.js") : void 0) !== null;
            }).first().attr('src');
            fullScriptSource = URI(scriptSource).absoluteTo(url).toString();
            return _extractScript(fullScriptSource).then(resolve, reject);
          } else if (error) {
            console.log("error", error);
            return reject(error);
          } else {
            console.log("error", body);
            return reject(new Error("http error: " + response + ", body: " + body));
          }
        });
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

  _extractScript = function(scriptUrl) {
    return new Promise(function(resolve, reject) {
      var options;
      options = {
        url: scriptUrl,
        headers: {
          'User-Agent': USER_AGENT
        }
      };
      return request(options, function(error, response, body) {
        var host, hostRegexp, images, imagesRegexp;
        if (!error && response.statusCode === 200) {
          imagesRegexp = new RegExp('picAy\\[[0-9]+\\] = "([^\\"]+)";', 'g');
          hostRegexp = new RegExp('var hosts = \\[\\"([^\\"]+)\\"');
          host = body.match(hostRegexp)[1];
          images = body.match(imagesRegexp).map(function(match) {
            var image;
            image = match.match(new RegExp('picAy\\[[0-9]+\\] = "([^\\"]+)";'))[1];
            return "" + host + image;
          });
          return resolve(images);
        } else if (error) {
          console.log("error", error);
          return reject(error);
        } else {
          console.log("error", body);
          return reject(new Error("http error: " + response + ", body: " + body));
        }
      });
    });
  };

  module.exports = SFScraper;

}).call(this);

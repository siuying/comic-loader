request = require('request')
cheerio = require('cheerio')
Promise = require('es6-promise').Promise
URI = require('URIjs')
_ = require('lodash')

ComicLoader = require('../comic-loader')
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0"

SFScraper =
  code: "sf"

  # find recently updated comics.
  # return a promise that on success, pass array of objects having following properties:
  #   - group
  #   - name
  #   - issue
  #   - thumbnail
  #   - url
  recent: ->
    new Promise (resolve, reject) ->
      url = "http://comic.sfacg.com/WeeklyUpdate/"
      options =
        url: url
        headers:
          'User-Agent': USER_AGENT
      request options, (error, response, body) ->
        if !error && response.statusCode == 200
          $ = cheerio.load(body)
          results = (_extractDayComic($, "#Day#{i}", "#Menu_#{i}") for i in [0..7])
          results = _.flatten(results)
          resolve(results)
        else if error
          reject(error)
        else
          reject(new Error("http error: #{response}, body: #{body}"))

  # find comics with specific keyword
  # return a promise that on success, pass array of objects having following properties:
  #   - name
  #   - thumbnail
  #   - url
  search: (keyword) ->
    new Promise (resolve, reject) ->
      encodedKeyword = encodeURI(keyword)
      url = "http://s.sfacg.com/?Key=#{encodedKeyword}&S=&SS="
      options =
        url: url
        headers:
          'User-Agent': USER_AGENT
      request options, (error, response, body) ->
        if !error && response.statusCode == 200
          $ = cheerio.load(body)

          table = $("#form1 table")
            .filter((i, elem) -> $(".Conjunction", elem).length > 0)
            .first()

          results = []
          $("ul", table).each (i, item) ->
            image = $("img", item)
            thumbnail = image.attr('src') if image
            link = $("a", item)
            url = link.attr('href') if link
            name = link.text() if link
            results.push({thumbnail: thumbnail, url: url, name: name})
          resolve(results)
        else if error
          reject(error)
        else
          reject(new Error("http error: #{response}, body: #{body}"))

  # list available issues of a comic
  # url - a comic URL
  # return a promise that on success, pass array of objects having following properties:
  #   - issues
  #     - name
  #     - url
  issues: (url) ->
    new Promise (resolve, reject) ->
      options =
        url: url
        headers:
          'User-Agent': USER_AGENT
      request options, (error, response, body) ->
        if !error && response.statusCode == 200
          issues = []
          $ = cheerio.load(body)
          $("script").remove()

          # find 正篇 comic list
          $("table.base_line")
            .first()
            .parent("td")
            .children()
            .filter((i, elem) -> $(".serialise_list_bg1", elem).text().indexOf("正     篇") > -1 )
            .next()
            .children("li")
            .each((i, elem) ->
              link = $("a", elem)
              if link
                issueUrl = URI(link.attr('href')).absoluteTo(url).toString()
                issueName = link.text()
                issues.push {url: issueUrl, name: issueName}
            )

          resolve({issues: issues})
        else if error
          reject(error)
        else
          reject(new Error("http error #{response.statusCode}: #{response}, body: #{body}"))

  # give an issue url, find all pages of that issue
  # url - URL to an issue
  # return a promise that on success, pass array of URL to images of the page
  pages: (url) ->
    console.log("pages", url)
    new Promise (resolve, reject) ->
      options =
        url: url
        headers:
          'User-Agent': USER_AGENT
      request options, (error, response, body) ->
        if !error && response.statusCode == 200
          $ = cheerio.load(body)
          scriptSource = $("script").filter((i, e) -> $(e).attr('src')?.match("^/Utility/.+/.+\.js") != null ).first().attr('src')
          fullScriptSource = URI(scriptSource).absoluteTo(url).toString()
          _extractScript(fullScriptSource).then(resolve, reject)
        else if error
          console.log("error", error)
          reject(error)
        else
          console.log("error", body)
          reject(new Error("http error: #{response}, body: #{body}"))

_extractDayComic = ($, comicQuery, titleQuery) ->
  items = []

  date = $(titleQuery).text()

  $("#{comicQuery} table table").each (index, item) ->
    link      = $("a", item)
    url       = link?.attr('href')
    image     = $("img", item)
    thumbnail = image?.attr('src')
    name      = image?.attr('alt')
    issue     = $("tr:last-child > td", item).text()
    items.push {group: date, name: name, issue: issue, thumbnail: thumbnail, url: url}
  return items

_extractScript = (scriptUrl) ->
  new Promise (resolve, reject) ->
    options =
      url: scriptUrl
      headers:
        'User-Agent': USER_AGENT
    request options, (error, response, body) ->
      if !error && response.statusCode == 200
        imagesRegexp = new RegExp('picAy\\[[0-9]+\\] = "([^\\"]+)";', 'g')
        hostRegexp = new RegExp('var hosts = \\[\\"([^\\"]+)\\"')
        host = body.match(hostRegexp)[1]
        images = body.match(imagesRegexp).map (match) ->
          image = match.match(new RegExp('picAy\\[[0-9]+\\] = "([^\\"]+)";'))[1]
          "#{host}#{image}"
        resolve(images)
      else if error
        console.log("error", error)
        reject(error)
      else
        console.log("error", body)
        reject(new Error("http error: #{response}, body: #{body}"))
module.exports = SFScraper

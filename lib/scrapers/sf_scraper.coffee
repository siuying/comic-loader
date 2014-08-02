phridge = require('phridge')
request = require('request')
cheerio = require('cheerio')
Promise = require('es6-promise').Promise
URI = require('URIjs')
_ = require('lodash')

ComicReader = require('../comic-reader')
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0"

phridge.config.stdout = null
phridge.config.stderr = null

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

          results = $("ul", table).map (i, item) ->
            image = $("img", item)
            thumbnail = image.attr('src') if image
            link = $("a", item)
            url = link.attr('href') if link
            name = link.text() if link
            return {thumbnail: thumbnail, url: url, name: name}
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
  pages: (url, success, failure) ->
    new Promise (resolve, reject) ->
      return phridge.spawn({loadImages: false})
        .then((phantom) -> phantom.openPage(url))
        .then((page) ->
          page.run ->
            this.evaluate ->
              images = [];

              # NextPage() is defined in the page, which should change curPic
              while true
                image = document.querySelector("#curPic").src
                if !image || images.indexOf(image) > -1
                  break
                else
                  images.push(image)
                  NextPage()

              return images
        )
        .finally(phridge.disposeAll)
        .done(resolve, reject)

_extractDayComic = ($, comicQuery, titleQuery) ->
  items = []

  date = $(titleQuery).text()

  $("#{comicQuery} table table").each (index, item) ->
    link = $("a", item)
    url = link.attr('href') if link
    image = $("img", item)
    thumbnail = image.attr('src') if image
    name = image.attr('alt') if image
    issue = $("tr:last-child > td", item).text()
    items.push {group: date, name: name, issue: issue, thumbnail: thumbnail, url: url}
  return items

ComicReader.register(SFScraper.code, SFScraper)

module.exports = SFScraper

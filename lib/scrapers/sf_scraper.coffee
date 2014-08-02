phridge = require('phridge')
request = require('request')
cheerio = require('cheerio')
URI = require('URIjs')
ComicReader = require('../comic-reader')

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:31.0) Gecko/20100101 Firefox/31.0"

SFScraper =
  code: "sf"

  # find comics with specific keyword
  # success - a function with parameter "results", array of objects having following properties:
  #   - name
  #   - thumbnail
  #   - url
  # failure - a function with parameter "error"
  search: (keyword, success, failure) ->
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
        success(results)
      else if error
        failure(error)
      else
        failure(new Error("http error: #{response}, body: #{body}"))

  # list available issues of a comic
  # url - a comic URL
  # success - success callback
  # failure - failure callback
  list: (url, success, failure) ->
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

        success({issues: issues})
      else if error
        failure(error)
      else
        failure(new Error("http error #{response.statusCode}: #{response}, body: #{body}"))

  # give an issue url, find all images of that issue
  # url - URL to an issue
  # success - a function with parameter "images", which is array of URL to images
  # failure - a function with parameter "error"
  issue: (url, success, failure) ->
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
      .done(success, failure)

ComicReader.register(SFScraper.code, SFScraper)

module.exports = SFScraper

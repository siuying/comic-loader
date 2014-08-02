phridge = require('phridge')
request = require('request')
cheerio = require('cheerio')
ComicReader = require('../comic-reader')

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
    request url, (error, response, body) ->
      if !error && response.statusCode == 200
        $ = cheerio.load(body)

        row = $("#form1 table")
          .filter((i, elem) -> $(".Conjunction", elem).length > 0)
          .first()

        results = $("ul", row).map (i, item) ->
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
        failure(new Error("http error: #{response}"))

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

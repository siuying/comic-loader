phridge = require('phridge')
ComicReader = require('../comic-reader')

SFScraper =
  code: "sf"

  # give an issue url, find all images of that issue
  # url - URL to an issue
  # success - a function with one parameter: images, which is array of URL to images
  issue: (url, success, failure) ->
    return phridge.spawn({loadImages: false})
      .then((phantom) -> phantom.openPage(url))
      .then((page) ->
        page.run ->
          this.evaluate ->
            images = [];

            # NextPage() load next image
            while true
              image = document.querySelector("#curPic").src
              if images.indexOf(image) > -1
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

phridge = require('phridge')
ComicReader = require('../comic-reader')

SFScraper =
  code: "sf"

  # give an issue url, find the urls of images of all issue
  # url - URL to an issue
  # success - a function with one parameter: images, which is array of URL to images
  issue: (url, success, failure) ->
    return phridge.spawn()
      .then((phantom) -> phantom.openPage(url))
      .then((page) ->
        page.run ->
          this.evaluate ->
            images = [];

            # NextPage(), curIndex and picCount are defined in the page
            # NextPage() increment curIndex and update #curPic source
            while (curIndex < picCount)
              images.push(document.querySelector("#curPic").src);
              NextPage()

            return images;
      )
      .finally(phridge.disposeAll)
      .done(success, failure)

ComicReader.register(SFScraper.code, SFScraper)

module.exports = SFScraper

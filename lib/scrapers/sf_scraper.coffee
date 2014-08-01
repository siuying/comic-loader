phridge = require('phridge')

class SFScraper
  # give an issue url, find the urls of images of all issue
  # url - URL to an issue
  # callback - a function with one parameters: images, which is array of URL to images
  @issue: (url, callback) ->
    phridge.spawn().then((phantom) ->
      phantom.openPage("http://example.com").then((page) ->
        url = page.evaluate(() -> document.querySelector("#curPic").src)
        resolve(url)
      )
    ).then((url) ->
      console.log("image url: ", url)
    )

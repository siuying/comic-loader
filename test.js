var ComicReader = require('./lib/comic-reader')
var SFScraper = require('./lib/scrapers/sf_scraper')

ComicReader.scraper("sf").issue("http://comic.sfacg.com/HTML/ASJS/102", function(images){
  console.log("loaded images:", images)
}, function(error){
  console.log("failed loading page:", error)
})

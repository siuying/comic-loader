_scrapers = {}

ComicLoader =
  register: (code, scraper) ->
    _scrapers[code] = scraper

  scraper: (code) ->
    _scrapers[code]

ComicLoader.SFScraper = require('./scrapers/sf_scraper')
ComicLoader.register(ComicLoader.SFScraper.code, ComicLoader.SFScraper)

module.exports = ComicLoader

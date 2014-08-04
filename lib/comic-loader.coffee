_scrapers = {}

ComicLoader =
  register: (code, scraper) ->
    _scrapers[code] = scraper

  scraper: (code) ->
    _scrapers[code]

module.exports = ComicLoader

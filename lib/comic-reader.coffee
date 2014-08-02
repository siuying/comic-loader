_scrapers = {}

ComicReader =
  register: (code, scraper) ->
    _scrapers[code] = scraper

  scraper: (code) ->
    _scrapers[code]

module.exports = ComicReader

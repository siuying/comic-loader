ComicReader =
  scrapers: {}

  register: (code, scraper) ->
    @scrapers[code] = scraper

  scraper: (code) ->
    @scrapers[code]

module.exports = ComicReader

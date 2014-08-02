ComicReader = require '../lib/comic-reader'
SFScraper = require '../lib/scrapers/sf_scraper'
expect = require('chai').expect

describe 'scraper', ->
  it 'should return SFScraper', ->
    scraper = ComicReader.scraper('sf')
    expect(scraper).to.have.property('code')
    expect(scraper).to.have.property('search')
    expect(scraper).to.have.property('issues')
    expect(scraper).to.have.property('pages')
    expect(scraper.code).to.equal('sf')
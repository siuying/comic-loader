SFScraper = require '../lib/scrapers/sf_scraper'
expect = require('chai').expect

describe 'issue', ->
  it 'should return an issues images', (done) ->
    this.timeout(20000) # 20s timeout
    url = "http://comic.sfacg.com/HTML/ASJS/102/"
    success = (images) ->
      expect(images).to.have.length(18)
      done()
    failure = (error) ->
      throw error
    images = SFScraper.issue(url, success, failure)

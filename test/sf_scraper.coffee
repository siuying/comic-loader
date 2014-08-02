SFScraper = require '../lib/scrapers/sf_scraper'
expect = require('chai').expect
_ = require('lodash')

describe 'issue', ->
  it 'should return an issues images', (done) ->
    this.timeout(20000) # 20s timeout
    url = "http://comic.sfacg.com/HTML/ASJS/102/"
    success = (images) ->
      expect(images).to.have.length(18)
      expect(_.first(images)).to.equal("http://coldpic.sfacg.com/Pic/OnlineComic4/ASJS/102/001_9447.jpg")
      expect(_.last(images)).to.equal("http://coldpic.sfacg.com/Pic/OnlineComic4/ASJS/102/018_4303.png")
      done()
    failure = (error) ->
      throw error
    images = SFScraper.issue(url, success, failure)

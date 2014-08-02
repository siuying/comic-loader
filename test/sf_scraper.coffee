SFScraper = require '../lib/scrapers/sf_scraper'
expect = require('chai').expect
_ = require('lodash')

describe 'search', ->
  it 'should search a comic', (done) ->
    this.timeout(10000)
    success = (results) ->
      expect(results).not.to.be.null
      expect(results).to.have.length(19)

      first = _.first(results)
      expect(first.thumbnail).to.equal("http://mh.sfacg.com/Logo/OnePiece.jpg")
      expect(first.url).to.equal("http://comic.sfacg.com/HTML/OnePiece")
      expect(first.name).to.equal("海贼王/One Piece")

      done()
    failure = (error) ->
      throw error
    comics = SFScraper.search("海", success, failure)

describe 'list', ->
  it 'should list issues of a comic', (done) ->
    this.timeout(5000)
    success = (result) ->
      expect(result.issues).to.have.length.of.at.least(400)

      # result is in reversed order!
      issue = _.last(result.issues)
      expect(issue.name).to.equal("001卷")
      expect(issue.url).to.equal("http://comic.sfacg.com/HTML/OnePiece/001j/")
      done()
    failure = (error) ->
      throw error
    SFScraper.list("http://comic.sfacg.com/HTML/OnePiece/", success, failure)

describe 'issue', ->
  it 'should return an issues images', (done) ->
    this.timeout(20000) # 20s timeout
    url = "http://comic.sfacg.com/HTML/OnePiece/001j/"
    success = (images) ->
      expect(images).to.have.length(104)
      expect(_.first(images)).to.equal("http://hotpic.sfacg.com/Pic/OnlineComic1/OnePiece/001j/001_18620.jpg")
      expect(_.last(images)).to.equal("http://hotpic.sfacg.com/Pic/OnlineComic1/OnePiece/001j/104_31044.jpg")
      done()
    failure = (error) ->
      throw error
    images = SFScraper.issue(url, success, failure)

SFScraper = require '../lib/scrapers/sf_scraper'
expect = require('chai').expect
_ = require('lodash')

describe 'recent', ->
  it 'should return list of recent comic', (done) ->
    this.timeout(10000)
    SFScraper.recent().then((results) ->
      expect(results).not.to.be.null
      expect(results).to.have.length.of.at.least(1)

      first = _.first(results)
      expect(first).to.have.property('group')
      expect(first).to.have.property('name')
      expect(first).to.have.property('issue')
      expect(first).to.have.property('thumbnail')
      expect(first).to.have.property('url')
      done()
    ).catch((error) -> throw error)

describe 'search', ->
  it 'should search a comic', (done) ->
    this.timeout(10000)
    SFScraper.search("海").then((results) ->
      expect(results).not.to.be.null
      expect(results).to.have.length(19)

      first = _.first(results)
      expect(first.thumbnail).to.equal("http://mh.sfacg.com/Logo/OnePiece.jpg")
      expect(first.url).to.equal("http://comic.sfacg.com/HTML/OnePiece")
      expect(first.name).to.equal("海贼王/One Piece")

      done()
    ).catch((error) -> throw error)

describe 'issues', ->
  it 'should list issues of a comic', (done) ->
    this.timeout(5000)
    SFScraper.issues("http://comic.sfacg.com/HTML/OnePiece/").then((results) ->
      expect(results.issues).to.have.length.of.at.least(400)

      # result is in reversed order!
      issue = _.last(results.issues)
      expect(issue.name).to.equal("001卷")
      expect(issue.url).to.equal("http://comic.sfacg.com/HTML/OnePiece/001j/")
      done()
    ).catch((error) -> throw error)

describe 'pages', ->
  it 'should return an issues images', (done) ->
    this.timeout(10000) # 30s timeout
    url = "http://comic.sfacg.com/HTML/OnePiece/001j/"
    SFScraper.pages(url).then((images) ->
      expect(images).to.have.length(104)
      expect(_.first(images)).to.equal("http://hotpic.sfacg.com/Pic/OnlineComic1/OnePiece/001j/001_18620.jpg")
      expect(_.last(images)).to.equal("http://hotpic.sfacg.com/Pic/OnlineComic1/OnePiece/001j/104_31044.jpg")
      done()
    , (e) -> throw e)

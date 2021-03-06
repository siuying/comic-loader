#!/usr/bin/env node

var optimist = require('optimist');
var rc = require('rc');
var download = require('download');
var path = require('path');
var phridge = require('phridge');
var Promise = require('es6-promise').Promise;
var spawn = require('child_process').spawn;
var _ = require('lodash')

var ComicLoader = require('../lib/comic-loader')
var SFScraper = require('../lib/scrapers/sf_scraper')
var scraper = ComicLoader.scraper('sf')

process.title = 'comic-loader';

var argv = rc('comic-loader', {}, optimist
  .usage('Usage: $0 comic-name [issue] [option]')
  .alias('o', 'output').describe('o', 'save comic to a directory, default current path')
  .alias('a', 'all').describe('a', 'download all issues of the comic')
  .argv);

var $comicName   = argv._[0];
var $comicIssue  = argv._[1];
var $downloadAll = argv.all;
var $outputDirectory = argv.output;

if (!$comicName) {
  optimist.showHelp();
  process.exit(1);
}

if (!$outputDirectory) {
  $outputDirectory = "./"
}

var createDownloadPagesPromise = function(comicName, issueName, outputDirectory) {
  return function(pages){
    console.log("Downloading: ", comicName, issueName, "...");
    // Prepare list of files to be download and the target file
    var files = _(pages).map(function(page, index){
      var name = "00000" + (index+1);
      name = name.substring(name.length - 4, name.length);
      var ext = path.extname(page);
      var filename = name + ext
      return {url: page, name: filename}
    }).value();

    // Download files
    return download(files, outputDirectory);
  };
};

// Search comic with the specific name
var scrape = scraper.search($comicName).then(function(issues){
  // For the first comic found, find all issues
  var first = issues[0]
  if (first) {
    $comicName = first.name;
    return scraper.issues(first.url);
  } else {
    throw new Error("\"" + $comicName + "\" not found");
  }
}).then(function(issues){
  if ($downloadAll) {
    var promise;
    _(issues.issues).reverse().each(function(issue){
      var dest = path.join($outputDirectory, $comicName, issue.name);

      // find comic pages URL and download them
      if (promise) {
          promise = promise.then(function(){
            return scraper.pages(issue.url).then(createDownloadPagesPromise($comicName, issue.name, dest));
          });
      } else {
        promise = scraper.pages(issue.url).then(createDownloadPagesPromise($comicName, issue.name, dest));
      }
    });
    return promise;
  } else {
    // Find the issue which user requested
    var issue;
    if ($comicIssue) {
      issue = _(issues.issues).filter(function(issue){
        return issue.name && issue.name.match($comicIssue)
      }).first();
    } else {
      issue = _(issues.issues).first();
    }

    if (issue) {
      var dest = path.join($outputDirectory, $comicName, issue.name);
      // If issue found, list all pages
      return scraper.pages(issue.url).then(createDownloadPagesPromise($comicName, issue.name, dest));
    } else {
      console.log("Issue " + $comicIssue + " not found");
      throw new Error("Issue " + $comicIssue + " not found");
    }
  }
}).then(function(){
  phridge.destroyAll(function(){
    process.exit(0);
  });
}).catch(function(error){
  phridge.destroyAll(function(){
    console.error("Error: " + error);
    process.exit(2);
  });
});

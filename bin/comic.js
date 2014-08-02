#!/usr/bin/env node

var optimist = require('optimist');
var rc = require('rc');
var download = require('download');
var path = require('path');
var phridge = require('phridge');
var Promise = require('es6-promise').Promise;

process.title = 'comic';

var argv = rc('comic', {}, optimist
  .usage('Usage: $0 comic-name [issue] [option]')
  .alias('d', 'directory').describe('d', 'save comic to directory, default [comic-name]/[issue]')
  .argv);

var $comicName   = argv._[0];
var $comicIssue  = argv._[1];
var $outputDirectory = null;

if (!$comicName) {
  optimist.showHelp();
  process.exit(1);
}

if (argv.directory) {
  $outputDirectory = argv.directory
}

var errorHandler = function(error){
  console.error("Error: " + error);
  process.exit(2);
}

var ComicReader = require('../lib/comic-reader')
var SFScraper = require('../lib/scrapers/sf_scraper')
var _ = require('lodash')
var scraper = ComicReader.scraper('sf')

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
  // Find the issue which user requested
  var issue;

  if ($comicIssue) {
    issue = _(issues.issues).filter(function(issue){
      return issue.name && issue.name.indexOf($comicIssue) === 0
    }).first();
  } else {
    issue = _(issues.issues).first();
  }

  if (issue) {
    if (!$outputDirectory) {
      $outputDirectory = path.join($comicName, issue.name);
    }
    // If issue found, list all pages
    console.log("Downloading: ", $comicName, issue.name, "...");
    return scraper.pages(issue.url);
  } else {
    throw new Error("Issue " + issueName + " not found");
  }
}).then(function(pages){
  // Prepare list of files to be download and the target file
  var files = _(pages).map(function(page, index){
    var name = "00000" + (index+1);
    name = name.substring(name.length - 4, name.length);
    var ext = path.extname(page);
    var filename = name + ext
    return {url: page, name: filename}
  }).value();

  // Download files
  return download(files, $outputDirectory);
}).then(function(){
  console.log("completed.")
  phridge.destroyAll(function(){
    process.exit(0);
  });
}).catch(function(error){
  phridge.destroyAll(function(){
    console.error("Error: " + error);
    process.exit(2);
  });
});

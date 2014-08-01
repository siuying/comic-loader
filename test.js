var phridge = require('phridge')
phridge.spawn().then(function(phantom){
  phantom.run("http://www.theverge.com/2013/1/7/3835724/the-price-of-apps", "#stream_title", function (url, selector, resolve) {
      var page = webpage.create();
      page.open(url, function () {
          var text = page.evaluate(function (selector) {
              return document.querySelector(selector).innerText;
          }, selector);
          resolve(text);
      });
  }).then(function (text) {
      // inside node again
      console.log("The element contains the following text: "+ text);
      phantom.dispose();
  });
})

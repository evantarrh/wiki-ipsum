(function(window) {

  "use strict";

  function IpsumError(message) {
    this.message = message;
    this.name = 'IpsumError';
  }

  function _formatSpaces(title) {
    return title.replace(/ /g, '%20');
  }

  function _getRandomWikiPage() {
    var script = document.createElement('script');
    script.src = 'https://en.wikipedia.org/w/api.php?' +
      'action=query&list=random&rnnamespace=0&prop=extracts&format=json&callback=_getPageContents';

    document.body.appendChild(script);
  }

  function Ipsum() {
    this.elements = document.getElementsByClassName('ipsum');
    return this;
  }

  Ipsum.prototype.init = function() {
    var page = _getRandomWikiPage();
  };

  // The JSONP callbacks must be global functions
  window._getPageContents = function(data) {
    var title = _formatSpaces(data.query.random[0].title);
    var script = document.createElement('script');
    script.src = 'https://en.wikipedia.org/w/api.php?' +
      'action=parse&page=' + title + '&prop=text&format=json&callback=_parseArticle';

    document.body.appendChild(script);
  };

  window._parseArticle = function(data) {
    console.log(data);
    var content = data.parse.text['*'];
    document.body.insertAdjacentHTML('beforeend', content);
  }

  window.Ipsum = Ipsum;

}(window));

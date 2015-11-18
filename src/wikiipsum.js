(function(window) {

  "use strict";
  var _wikiParagraphs = [];

  function Ipsum() {
    this.elements = document.getElementsByClassName('ipsum');
    return this;
  }

  Ipsum.prototype.init = function() {
    _getRandomWikiPage();
    _parseWhenReady('#_wiki-content');
    this.insertParagraphsWhenReady(this.elements);
  };

  Ipsum.prototype.insertParagraphsWhenReady = function(elementsToReplace) {
    if (_wikiParagraphs.length !== 0) {
      var wikiParagraphIndex = 0;
      while (elementsToReplace.length > 0) {
        var elToReplace = elementsToReplace[0];
        var newElement = '<p class="_ipsum-paragraph">' +
          _wikiParagraphs[wikiParagraphIndex++ % _wikiParagraphs.length] +
          '</p>';
        elToReplace.insertAdjacentHTML('afterend', newElement);
        elToReplace.remove();
      }
    }
    else {
      setTimeout(function() { Ipsum.prototype.insertParagraphsWhenReady(elementsToReplace) }, 100);
    }
  };

  function IpsumError(message) {
    this.message = message;
    this.name = 'IpsumError';
  }

  function _parseWhenReady(selector) {
    var observer = new MutationObserver(_checkForContent);
    observer.observe(window.document.documentElement, {
        childList: true,
        subtree: true
    });
    _checkForContent();
  }

  function _checkForContent(cb) {
    var content = window.document.getElementById('_wiki-content');
    if(content !== null){
      _wikiParagraphs = _parseContent(content);
    }
  }

  function _getRandomWikiPage() {
    var script = document.createElement('script');
    script.id = '_wiki-script-1'
    script.src = 'https://en.wikipedia.org/w/api.php?' +
      'action=query&list=random&rnnamespace=0&prop=extracts&format=json&callback=_getPageContents';

    document.body.appendChild(script);
  }

  function _parseContent(DOMContent) {
    var allParagraphs = [];
    var paragraphObj = DOMContent.getElementsByTagName('p');
    for (var key in paragraphObj) {
      if (paragraphObj.hasOwnProperty(key)) {
        allParagraphs.push(paragraphObj[key].innerHTML);
      }
    }

    return allParagraphs.filter(function(p) {
      return (_lengthOfElementContent(p) > 100);
    }).map(function(p) {
      return _formatLinksInElement(p);
    });
  }

  function _lengthOfElementContent(el) {
    return el.replace(/<[^>]*>/g, '').length;
  }

  function _formatSpaces(title) {
    return title.replace(/ /g, '%20');
  }

  function _formatLinksInElement(el) {
    return el.replace(/href=\"/g, 'href="https://en.wikipedia.org');
  }

  // The JSONP callbacks must be global functions
  window._getPageContents = function(data) {
    // first, remove the old script from the body
    document.body.removeChild(document.getElementById('_wiki-script-1'));

    var title = _formatSpaces(data.query.random[0].title);
    var script = document.createElement('script');
    script.id = '_wiki-script-2';
    script.src = 'https://en.wikipedia.org/w/api.php?' +
      'action=parse&page=' + title + '&prop=text&format=json&callback=_insertArticle';

    document.body.appendChild(script);
  };

  window._insertArticle = function(data) {
    document.body.removeChild(document.getElementById('_wiki-script-2'));

    var contentWithWrapper =
      '<div id="_wiki-content" style="display:none;">' +
      data.parse.text['*'] +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', contentWithWrapper);
  };

  window.Ipsum = Ipsum;

}(window));

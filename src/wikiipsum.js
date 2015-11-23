(function(window) {

  "use strict";
  var _wikiParagraphs = [];

  function Ipsum() {
    return this;
  }

  Ipsum.prototype.init = function() {
    _getRandomWikiPage();
    _parseWhenReady('#_wiki-content');
    this.insertParagraphsWhenReady(document.getElementsByClassName('ipsum'));
  };

  Ipsum.prototype.insertParagraphsWhenReady = function(elementsToReplace) {
    if (_wikiParagraphs.length !== 0) {
      var reload = false;
      while ((elementsToReplace.length > 0) && !reload) {
        if (_wikiParagraphs.length !== 0) {
          var newElement = '<p class="ipsum-paragraph">' +
            _wikiParagraphs.shift() +
            '</p>';

          var elToReplace = elementsToReplace[0];
          elToReplace.insertAdjacentHTML('afterend', newElement);
          elToReplace.remove();
        }
        else {
          reload = true;
          this.init();
        }
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

  function _parseContent(wikiDOM) {
    var allParagraphs = [];
    var paragraphObj = wikiDOM.getElementsByTagName('p');

    for (var key in paragraphObj) {
      if (paragraphObj.hasOwnProperty(key)) {
        var paragraphToPush = _removeFootnoteLinks(paragraphObj[key]);
        allParagraphs.push(paragraphToPush.innerHTML);
      }
    }

    // once we've replaced all elements, remove all of the wiki content from the DOM
    document.getElementById('_wiki-content').remove();

    var validParagraphs = _filterParagraphs(allParagraphs);

    // Some articles (e.g. disambiguation articles) have no paragraphs.
    // In such cases, we have to reinitialize.
    if (validParagraphs.length === 0) {
      console.log('We found an article with no paragraphs. Trying again...');
      Ipsum.prototype.init();
    }

    return validParagraphs;
  }

  function _filterParagraphs (paragraphs) {
    return paragraphs.filter(function(p) {
      return (_lengthOfElementContent(p) > 100);
    }).map(function(p) {
      return _formatLinksInElement(p);
    });
  }

  function _removeFootnoteLinks(el) {
    var footnotes = el.getElementsByTagName("sup");
    var i = 0;
    for (i = footnotes.length - 1; i >= 0; i--) {
        footnotes[i].parentNode.removeChild(footnotes[i]);
    }
    return el;
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

    // the random article API only returns a title, so we make another
    // request to get the rest of the article
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

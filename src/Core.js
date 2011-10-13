var html2canvas = {};

html2canvas.logging = true;

html2canvas.log = function (a) {
    if (html2canvas.logging) {
        window.console.log(a);
    }
};

html2canvas.Util = {};

html2canvas.Util.backgroundImage = function (src) {

    if (/data:image\/.*;base64,/i.test( src ) || /^(-webkit|-moz|linear-gradient|-o-)/.test( src )) {
        return src;
    }

    if (src.toLowerCase().substr( 0, 5 ) === 'url("') {
        src = src.substr( 5 );
        src = src.substr( 0, src.length - 2 );
    } else {
        src = src.substr( 4 );
        src = src.substr( 0, src.length - 1 );
    }

    return src;
};

html2canvas.Util.Bounds = function getBounds (el) {

    window.scroll(0,0);
    var clientRect,
    bounds = {};

    if (el.getBoundingClientRect){
        clientRect = el.getBoundingClientRect();


        // TODO add scroll position to bounds, so no scrolling of window necessary
        bounds.top = clientRect.top;
        bounds.bottom = clientRect.bottom || (clientRect.top + clientRect.height);
        bounds.left = clientRect.left;
        bounds.width = clientRect.width;
        bounds.height = clientRect.height;

        return bounds;

    } /*else{


            p = $(el).offset();

            return {
                left: p.left + getCSS(el,"borderLeftWidth", true),
                top: p.top + getCSS(el,"borderTopWidth", true),
                width:$(el).innerWidth(),
                height:$(el).innerHeight()
            };


        }     */
}

html2canvas.Util.getCSS = function (el, attribute) {
    if (el.style[attribute]) {
        // If the property exists in style[], then it's been set
        // recently (and is current)
        return el.style[attribute];
    } else if (el.currentStyle) {
        // Otherwise, try to use IE's method
        return el.currentStyle[attribute];
    } else if ( document.defaultView && document.defaultView.getComputedStyle) {
        // It uses the traditional 'text-align' style of rule writing,
        // instead of textAlign
        attribute = attribute.replace(/([A-Z])/g,"-$1");
        attribute = attribute.toLowerCase();

        // Get the style object and get the value of the property (if it exists)
        var s = document.defaultView.getComputedStyle(el,"");
        return s && s.getPropertyValue(attribute);
    } else {
        // Otherwise we're using some other browser
        return null;
    }
};

html2canvas.Util.Extend = function (options, defaults) {
    var key;
    for (key in options) {
        if (options.hasOwnProperty(key)) {
            defaults[key] = options[key];
        }
    }
    return defaults;
};

html2canvas.Util.index = function(el) {
  var nodes = el.parentNode.childNodes,
      node,
      i = 0,
      count = 0;
  while( (node=nodes.item(i++)) && node!=el ) {
    if( node.nodeType==1 ) {
      count++;
    }
  }
  return count;
};

html2canvas.Util.Children = function(el) {
    if ( el.nodeName && 'iframe' === el.nodeName.toLowerCase() ) {
      var re = new RegExp(':\/\/'+document.domain);
      if ( re.test(el.src) ) {
        return el.contentDocument || el.contentWindow.document;
      } else {
        return [];
      }
    } else {
      return el.childNodes || [];
    }
    // Check if we are not dealing with pixels, (Opera has issues with this)
    // Ported from jQuery css.js
    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels

    // if ( !/^-?\d+(?:px)?$/i.test( val ) && /^-?\d/.test( val ) ) {
    /*
        // Remember the original values
        left = style.left;

        // Put in the new values to get a computed value out
        if ( rsLeft ) {
            el.runtimeStyle.left = el.currentStyle.left;
        }
        style.left = attribute === "fontSize" ? "1em" : (val || 0);
        val = style.pixelLeft + "px";

        // Revert the changed values
        style.left = left;
        if ( rsLeft ) {
            el.runtimeStyle.left = rsLeft;
        }*/
};

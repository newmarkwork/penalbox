(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var imagesloaded = {exports: {}};

	var evEmitter = {exports: {}};

	/**
	 * EvEmitter v2.1.1
	 * Lil' event emitter
	 * MIT License
	 */

	var hasRequiredEvEmitter;

	function requireEvEmitter () {
		if (hasRequiredEvEmitter) return evEmitter.exports;
		hasRequiredEvEmitter = 1;
		(function (module) {
			(function (global, factory) {
			  // universal module definition
			  if (module.exports) {
			    // CommonJS - Browserify, Webpack
			    module.exports = factory();
			  } else {
			    // Browser globals
			    global.EvEmitter = factory();
			  }
			})(typeof window != 'undefined' ? window : commonjsGlobal, function () {
			  function EvEmitter() {}
			  let proto = EvEmitter.prototype;
			  proto.on = function (eventName, listener) {
			    if (!eventName || !listener) return this;

			    // set events hash
			    let events = this._events = this._events || {};
			    // set listeners array
			    let listeners = events[eventName] = events[eventName] || [];
			    // only add once
			    if (!listeners.includes(listener)) {
			      listeners.push(listener);
			    }
			    return this;
			  };
			  proto.once = function (eventName, listener) {
			    if (!eventName || !listener) return this;

			    // add event
			    this.on(eventName, listener);
			    // set once flag
			    // set onceEvents hash
			    let onceEvents = this._onceEvents = this._onceEvents || {};
			    // set onceListeners object
			    let onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
			    // set flag
			    onceListeners[listener] = true;
			    return this;
			  };
			  proto.off = function (eventName, listener) {
			    let listeners = this._events && this._events[eventName];
			    if (!listeners || !listeners.length) return this;
			    let index = listeners.indexOf(listener);
			    if (index != -1) {
			      listeners.splice(index, 1);
			    }
			    return this;
			  };
			  proto.emitEvent = function (eventName, args) {
			    let listeners = this._events && this._events[eventName];
			    if (!listeners || !listeners.length) return this;

			    // copy over to avoid interference if .off() in listener
			    listeners = listeners.slice(0);
			    args = args || [];
			    // once stuff
			    let onceListeners = this._onceEvents && this._onceEvents[eventName];
			    for (let listener of listeners) {
			      let isOnce = onceListeners && onceListeners[listener];
			      if (isOnce) {
			        // remove listener
			        // remove before trigger to prevent recursion
			        this.off(eventName, listener);
			        // unset once flag
			        delete onceListeners[listener];
			      }
			      // trigger listener
			      listener.apply(this, args);
			    }
			    return this;
			  };
			  proto.allOff = function () {
			    delete this._events;
			    delete this._onceEvents;
			    return this;
			  };
			  return EvEmitter;
			}); 
		} (evEmitter));
		return evEmitter.exports;
	}

	/*!
	 * imagesLoaded v5.0.0
	 * JavaScript is all like "You images are done yet or what?"
	 * MIT License
	 */

	(function (module) {
		(function (window, factory) {
		  // universal module definition
		  if (module.exports) {
		    // CommonJS
		    module.exports = factory(window, requireEvEmitter());
		  } else {
		    // browser global
		    window.imagesLoaded = factory(window, window.EvEmitter);
		  }
		})(typeof window !== 'undefined' ? window : commonjsGlobal, function factory(window, EvEmitter) {
		  let $ = window.jQuery;
		  let console = window.console;

		  // -------------------------- helpers -------------------------- //

		  // turn element or nodeList into an array
		  function makeArray(obj) {
		    // use object if already an array
		    if (Array.isArray(obj)) return obj;
		    let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
		    // convert nodeList to array
		    if (isArrayLike) return [...obj];

		    // array of single index
		    return [obj];
		  }

		  // -------------------------- imagesLoaded -------------------------- //

		  /**
		   * @param {[Array, Element, NodeList, String]} elem
		   * @param {[Object, Function]} options - if function, use as callback
		   * @param {Function} onAlways - callback function
		   * @returns {ImagesLoaded}
		   */
		  function ImagesLoaded(elem, options, onAlways) {
		    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
		    if (!(this instanceof ImagesLoaded)) {
		      return new ImagesLoaded(elem, options, onAlways);
		    }
		    // use elem as selector string
		    let queryElem = elem;
		    if (typeof elem == 'string') {
		      queryElem = document.querySelectorAll(elem);
		    }
		    // bail if bad element
		    if (!queryElem) {
		      console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
		      return;
		    }
		    this.elements = makeArray(queryElem);
		    this.options = {};
		    // shift arguments if no options set
		    if (typeof options == 'function') {
		      onAlways = options;
		    } else {
		      Object.assign(this.options, options);
		    }
		    if (onAlways) this.on('always', onAlways);
		    this.getImages();
		    // add jQuery Deferred object
		    if ($) this.jqDeferred = new $.Deferred();

		    // HACK check async to allow time to bind listeners
		    setTimeout(this.check.bind(this));
		  }
		  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
		  ImagesLoaded.prototype.getImages = function () {
		    this.images = [];

		    // filter & find items if we have an item selector
		    this.elements.forEach(this.addElementImages, this);
		  };
		  const elementNodeTypes = [1, 9, 11];

		  /**
		   * @param {Node} elem
		   */
		  ImagesLoaded.prototype.addElementImages = function (elem) {
		    // filter siblings
		    if (elem.nodeName === 'IMG') {
		      this.addImage(elem);
		    }
		    // get background image on element
		    if (this.options.background === true) {
		      this.addElementBackgroundImages(elem);
		    }

		    // find children
		    // no non-element nodes, #143
		    let {
		      nodeType
		    } = elem;
		    if (!nodeType || !elementNodeTypes.includes(nodeType)) return;
		    let childImgs = elem.querySelectorAll('img');
		    // concat childElems to filterFound array
		    for (let img of childImgs) {
		      this.addImage(img);
		    }

		    // get child background images
		    if (typeof this.options.background == 'string') {
		      let children = elem.querySelectorAll(this.options.background);
		      for (let child of children) {
		        this.addElementBackgroundImages(child);
		      }
		    }
		  };
		  const reURL = /url\((['"])?(.*?)\1\)/gi;
		  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
		    let style = getComputedStyle(elem);
		    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
		    if (!style) return;

		    // get url inside url("...")
		    let matches = reURL.exec(style.backgroundImage);
		    while (matches !== null) {
		      let url = matches && matches[2];
		      if (url) {
		        this.addBackground(url, elem);
		      }
		      matches = reURL.exec(style.backgroundImage);
		    }
		  };

		  /**
		   * @param {Image} img
		   */
		  ImagesLoaded.prototype.addImage = function (img) {
		    let loadingImage = new LoadingImage(img);
		    this.images.push(loadingImage);
		  };
		  ImagesLoaded.prototype.addBackground = function (url, elem) {
		    let background = new Background(url, elem);
		    this.images.push(background);
		  };
		  ImagesLoaded.prototype.check = function () {
		    this.progressedCount = 0;
		    this.hasAnyBroken = false;
		    // complete if no images
		    if (!this.images.length) {
		      this.complete();
		      return;
		    }

		    /* eslint-disable-next-line func-style */
		    let onProgress = (image, elem, message) => {
		      // HACK - Chrome triggers event before object properties have changed. #83
		      setTimeout(() => {
		        this.progress(image, elem, message);
		      });
		    };
		    this.images.forEach(function (loadingImage) {
		      loadingImage.once('progress', onProgress);
		      loadingImage.check();
		    });
		  };
		  ImagesLoaded.prototype.progress = function (image, elem, message) {
		    this.progressedCount++;
		    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
		    // progress event
		    this.emitEvent('progress', [this, image, elem]);
		    if (this.jqDeferred && this.jqDeferred.notify) {
		      this.jqDeferred.notify(this, image);
		    }
		    // check if completed
		    if (this.progressedCount === this.images.length) {
		      this.complete();
		    }
		    if (this.options.debug && console) {
		      console.log(`progress: ${message}`, image, elem);
		    }
		  };
		  ImagesLoaded.prototype.complete = function () {
		    let eventName = this.hasAnyBroken ? 'fail' : 'done';
		    this.isComplete = true;
		    this.emitEvent(eventName, [this]);
		    this.emitEvent('always', [this]);
		    if (this.jqDeferred) {
		      let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
		      this.jqDeferred[jqMethod](this);
		    }
		  };

		  // --------------------------  -------------------------- //

		  function LoadingImage(img) {
		    this.img = img;
		  }
		  LoadingImage.prototype = Object.create(EvEmitter.prototype);
		  LoadingImage.prototype.check = function () {
		    // If complete is true and browser supports natural sizes,
		    // try to check for image status manually.
		    let isComplete = this.getIsImageComplete();
		    if (isComplete) {
		      // report based on naturalWidth
		      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
		      return;
		    }

		    // If none of the checks above matched, simulate loading on detached element.
		    this.proxyImage = new Image();
		    // add crossOrigin attribute. #204
		    if (this.img.crossOrigin) {
		      this.proxyImage.crossOrigin = this.img.crossOrigin;
		    }
		    this.proxyImage.addEventListener('load', this);
		    this.proxyImage.addEventListener('error', this);
		    // bind to image as well for Firefox. #191
		    this.img.addEventListener('load', this);
		    this.img.addEventListener('error', this);
		    this.proxyImage.src = this.img.currentSrc || this.img.src;
		  };
		  LoadingImage.prototype.getIsImageComplete = function () {
		    // check for non-zero, non-undefined naturalWidth
		    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
		    return this.img.complete && this.img.naturalWidth;
		  };
		  LoadingImage.prototype.confirm = function (isLoaded, message) {
		    this.isLoaded = isLoaded;
		    let {
		      parentNode
		    } = this.img;
		    // emit progress with parent <picture> or self <img>
		    let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
		    this.emitEvent('progress', [this, elem, message]);
		  };

		  // ----- events ----- //

		  // trigger specified handler for event type
		  LoadingImage.prototype.handleEvent = function (event) {
		    let method = 'on' + event.type;
		    if (this[method]) {
		      this[method](event);
		    }
		  };
		  LoadingImage.prototype.onload = function () {
		    this.confirm(true, 'onload');
		    this.unbindEvents();
		  };
		  LoadingImage.prototype.onerror = function () {
		    this.confirm(false, 'onerror');
		    this.unbindEvents();
		  };
		  LoadingImage.prototype.unbindEvents = function () {
		    this.proxyImage.removeEventListener('load', this);
		    this.proxyImage.removeEventListener('error', this);
		    this.img.removeEventListener('load', this);
		    this.img.removeEventListener('error', this);
		  };

		  // -------------------------- Background -------------------------- //

		  function Background(url, element) {
		    this.url = url;
		    this.element = element;
		    this.img = new Image();
		  }

		  // inherit LoadingImage prototype
		  Background.prototype = Object.create(LoadingImage.prototype);
		  Background.prototype.check = function () {
		    this.img.addEventListener('load', this);
		    this.img.addEventListener('error', this);
		    this.img.src = this.url;
		    // check if image is already complete
		    let isComplete = this.getIsImageComplete();
		    if (isComplete) {
		      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
		      this.unbindEvents();
		    }
		  };
		  Background.prototype.unbindEvents = function () {
		    this.img.removeEventListener('load', this);
		    this.img.removeEventListener('error', this);
		  };
		  Background.prototype.confirm = function (isLoaded, message) {
		    this.isLoaded = isLoaded;
		    this.emitEvent('progress', [this, this.element, message]);
		  };

		  // -------------------------- jQuery -------------------------- //

		  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
		    jQuery = jQuery || window.jQuery;
		    if (!jQuery) return;

		    // set local variable
		    $ = jQuery;
		    // $().imagesLoaded()
		    $.fn.imagesLoaded = function (options, onAlways) {
		      let instance = new ImagesLoaded(this, options, onAlways);
		      return instance.jqDeferred.promise($(this));
		    };
		  };
		  // try making plugin
		  ImagesLoaded.makeJQueryPlugin();

		  // --------------------------  -------------------------- //

		  return ImagesLoaded;
		}); 
	} (imagesloaded));

	var imagesloadedExports = imagesloaded.exports;
	var imagesLoaded = /*@__PURE__*/getDefaultExportFromCjs(imagesloadedExports);

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }
	  return self;
	}
	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	/*!
	 * GSAP 3.11.4
	 * https://greensock.com
	 *
	 * @license Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	/* eslint-disable */
	var _config = {
	    autoSleep: 120,
	    force3D: "auto",
	    nullTargetWarn: 1,
	    units: {
	      lineHeight: ""
	    }
	  },
	  _defaults = {
	    duration: .5,
	    overwrite: false,
	    delay: 0
	  },
	  _suppressOverwrites,
	  _reverting$1,
	  _context,
	  _bigNum$1 = 1e8,
	  _tinyNum = 1 / _bigNum$1,
	  _2PI = Math.PI * 2,
	  _HALF_PI = _2PI / 4,
	  _gsID = 0,
	  _sqrt = Math.sqrt,
	  _cos = Math.cos,
	  _sin = Math.sin,
	  _isString = function _isString(value) {
	    return typeof value === "string";
	  },
	  _isFunction = function _isFunction(value) {
	    return typeof value === "function";
	  },
	  _isNumber = function _isNumber(value) {
	    return typeof value === "number";
	  },
	  _isUndefined = function _isUndefined(value) {
	    return typeof value === "undefined";
	  },
	  _isObject = function _isObject(value) {
	    return typeof value === "object";
	  },
	  _isNotFalse = function _isNotFalse(value) {
	    return value !== false;
	  },
	  _windowExists$1 = function _windowExists() {
	    return typeof window !== "undefined";
	  },
	  _isFuncOrString = function _isFuncOrString(value) {
	    return _isFunction(value) || _isString(value);
	  },
	  _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
	  // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
	  _isArray = Array.isArray,
	  _strictNumExp = /(?:-?\.?\d|\.)+/gi,
	  //only numbers (including negatives and decimals) but NOT relative values.
	  _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
	  //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
	  _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
	  _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
	  //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
	  _relExp = /[+-]=-?[.\d]+/,
	  _delimitedValueExp = /[^,'"\[\]\s]+/gi,
	  // previously /[#\-+.]*\b[a-z\d\-=+%.]+/gi but didn't catch special characters.
	  _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
	  _globalTimeline,
	  _win$1,
	  _coreInitted,
	  _doc$1,
	  _globals = {},
	  _installScope = {},
	  _coreReady,
	  _install = function _install(scope) {
	    return (_installScope = _merge(scope, _globals)) && gsap;
	  },
	  _missingPlugin = function _missingPlugin(property, value) {
	    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
	  },
	  _warn = function _warn(message, suppress) {
	    return !suppress && console.warn(message);
	  },
	  _addGlobal = function _addGlobal(name, obj) {
	    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
	  },
	  _emptyFunc = function _emptyFunc() {
	    return 0;
	  },
	  _startAtRevertConfig = {
	    suppressEvents: true,
	    isStart: true,
	    kill: false
	  },
	  _revertConfigNoKill = {
	    suppressEvents: true,
	    kill: false
	  },
	  _revertConfig = {
	    suppressEvents: true
	  },
	  _reservedProps = {},
	  _lazyTweens = [],
	  _lazyLookup = {},
	  _lastRenderedFrame,
	  _plugins = {},
	  _effects = {},
	  _nextGCFrame = 30,
	  _harnessPlugins = [],
	  _callbackNames = "",
	  _harness = function _harness(targets) {
	    var target = targets[0],
	      harnessPlugin,
	      i;
	    _isObject(target) || _isFunction(target) || (targets = [targets]);
	    if (!(harnessPlugin = (target._gsap || {}).harness)) {
	      // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
	      i = _harnessPlugins.length;
	      while (i-- && !_harnessPlugins[i].targetTest(target)) {}
	      harnessPlugin = _harnessPlugins[i];
	    }
	    i = targets.length;
	    while (i--) {
	      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
	    }
	    return targets;
	  },
	  _getCache = function _getCache(target) {
	    return target._gsap || _harness(toArray(target))[0]._gsap;
	  },
	  _getProperty = function _getProperty(target, property, v) {
	    return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
	  },
	  _forEachName = function _forEachName(names, func) {
	    return (names = names.split(",")).forEach(func) || names;
	  },
	  //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
	  _round = function _round(value) {
	    return Math.round(value * 100000) / 100000 || 0;
	  },
	  _roundPrecise = function _roundPrecise(value) {
	    return Math.round(value * 10000000) / 10000000 || 0;
	  },
	  // increased precision mostly for timing values.
	  _parseRelative = function _parseRelative(start, value) {
	    var operator = value.charAt(0),
	      end = parseFloat(value.substr(2));
	    start = parseFloat(start);
	    return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
	  },
	  _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
	    //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
	    var l = toFind.length,
	      i = 0;
	    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}
	    return i < l;
	  },
	  _lazyRender = function _lazyRender() {
	    var l = _lazyTweens.length,
	      a = _lazyTweens.slice(0),
	      i,
	      tween;
	    _lazyLookup = {};
	    _lazyTweens.length = 0;
	    for (i = 0; i < l; i++) {
	      tween = a[i];
	      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
	    }
	  },
	  _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
	    _lazyTweens.length && !_reverting$1 && _lazyRender();
	    animation.render(time, suppressEvents, _reverting$1 && time < 0 && (animation._initted || animation._startAt));
	    _lazyTweens.length && !_reverting$1 && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
	  },
	  _numericIfPossible = function _numericIfPossible(value) {
	    var n = parseFloat(value);
	    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
	  },
	  _passThrough = function _passThrough(p) {
	    return p;
	  },
	  _setDefaults = function _setDefaults(obj, defaults) {
	    for (var p in defaults) {
	      p in obj || (obj[p] = defaults[p]);
	    }
	    return obj;
	  },
	  _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
	    return function (obj, defaults) {
	      for (var p in defaults) {
	        p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
	      }
	    };
	  },
	  _merge = function _merge(base, toMerge) {
	    for (var p in toMerge) {
	      base[p] = toMerge[p];
	    }
	    return base;
	  },
	  _mergeDeep = function _mergeDeep(base, toMerge) {
	    for (var p in toMerge) {
	      p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
	    }
	    return base;
	  },
	  _copyExcluding = function _copyExcluding(obj, excluding) {
	    var copy = {},
	      p;
	    for (p in obj) {
	      p in excluding || (copy[p] = obj[p]);
	    }
	    return copy;
	  },
	  _inheritDefaults = function _inheritDefaults(vars) {
	    var parent = vars.parent || _globalTimeline,
	      func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
	    if (_isNotFalse(vars.inherit)) {
	      while (parent) {
	        func(vars, parent.vars.defaults);
	        parent = parent.parent || parent._dp;
	      }
	    }
	    return vars;
	  },
	  _arraysMatch = function _arraysMatch(a1, a2) {
	    var i = a1.length,
	      match = i === a2.length;
	    while (match && i-- && a1[i] === a2[i]) {}
	    return i < 0;
	  },
	  _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
	    var prev = parent[lastProp],
	      t;
	    if (sortBy) {
	      t = child[sortBy];
	      while (prev && prev[sortBy] > t) {
	        prev = prev._prev;
	      }
	    }
	    if (prev) {
	      child._next = prev._next;
	      prev._next = child;
	    } else {
	      child._next = parent[firstProp];
	      parent[firstProp] = child;
	    }
	    if (child._next) {
	      child._next._prev = child;
	    } else {
	      parent[lastProp] = child;
	    }
	    child._prev = prev;
	    child.parent = child._dp = parent;
	    return child;
	  },
	  _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
	    if (firstProp === void 0) {
	      firstProp = "_first";
	    }
	    if (lastProp === void 0) {
	      lastProp = "_last";
	    }
	    var prev = child._prev,
	      next = child._next;
	    if (prev) {
	      prev._next = next;
	    } else if (parent[firstProp] === child) {
	      parent[firstProp] = next;
	    }
	    if (next) {
	      next._prev = prev;
	    } else if (parent[lastProp] === child) {
	      parent[lastProp] = prev;
	    }
	    child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
	  },
	  _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
	    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
	    child._act = 0;
	  },
	  _uncache = function _uncache(animation, child) {
	    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
	      // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
	      var a = animation;
	      while (a) {
	        a._dirty = 1;
	        a = a.parent;
	      }
	    }
	    return animation;
	  },
	  _recacheAncestors = function _recacheAncestors(animation) {
	    var parent = animation.parent;
	    while (parent && parent.parent) {
	      //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
	      parent._dirty = 1;
	      parent.totalDuration();
	      parent = parent.parent;
	    }
	    return animation;
	  },
	  _rewindStartAt = function _rewindStartAt(tween, totalTime, suppressEvents, force) {
	    return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
	  },
	  _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
	    return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
	  },
	  _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
	    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
	  },
	  // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
	  _animationCycle = function _animationCycle(tTime, cycleDuration) {
	    var whole = Math.floor(tTime /= cycleDuration);
	    return tTime && whole === tTime ? whole - 1 : whole;
	  },
	  _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
	    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
	  },
	  _setEnd = function _setEnd(animation) {
	    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
	  },
	  _alignPlayhead = function _alignPlayhead(animation, totalTime) {
	    // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
	    var parent = animation._dp;
	    if (parent && parent.smoothChildTiming && animation._ts) {
	      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
	      _setEnd(animation);
	      parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
	    }
	    return animation;
	  },
	  /*
	  _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	  	let cycleDuration = duration + repeatDelay,
	  		time = _round(clampedTotalTime % cycleDuration);
	  	if (time > duration) {
	  		time = duration;
	  	}
	  	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
	  },
	  */
	  _postAddChecks = function _postAddChecks(timeline, child) {
	    var t;
	    if (child._time || child._initted && !child._dur) {
	      //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
	      t = _parentToChildTotalTime(timeline.rawTime(), child);
	      if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
	        child.render(t, true);
	      }
	    } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.

	    if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
	      //in case any of the ancestors had completed but should now be enabled...
	      if (timeline._dur < timeline.duration()) {
	        t = timeline;
	        while (t._dp) {
	          t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

	          t = t._dp;
	        }
	      }
	      timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
	    }
	  },
	  _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
	    child.parent && _removeFromParent(child);
	    child._start = _roundPrecise((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
	    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
	    _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);
	    _isFromOrFromStart(child) || (timeline._recent = child);
	    skipChecks || _postAddChecks(timeline, child);
	    timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime); // if the timeline is reversed and the new child makes it longer, we may need to adjust the parent's _start (push it back)

	    return timeline;
	  },
	  _scrollTrigger = function _scrollTrigger(animation, trigger) {
	    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
	  },
	  _attemptInitTween = function _attemptInitTween(tween, time, force, suppressEvents, tTime) {
	    _initTween(tween, time, tTime);
	    if (!tween._initted) {
	      return 1;
	    }
	    if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
	      _lazyTweens.push(tween);
	      tween._lazy = [tTime, suppressEvents];
	      return 1;
	    }
	  },
	  _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
	    var parent = _ref.parent;
	    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
	  },
	  // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
	  _isFromOrFromStart = function _isFromOrFromStart(_ref2) {
	    var data = _ref2.data;
	    return data === "isFromStart" || data === "isStart";
	  },
	  _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
	    var prevRatio = tween.ratio,
	      ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1,
	      // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0. Edge case: if a from() or fromTo() stagger tween is placed later in a timeline, the "startAt" zero-duration tween could initially render at a time when the parent timeline's playhead is technically BEFORE where this tween is, so make sure that any "from" and "fromTo" startAt tweens are rendered the first time at a ratio of 1.
	      repeatDelay = tween._rDelay,
	      tTime = 0,
	      pt,
	      iteration,
	      prevIteration;
	    if (repeatDelay && tween._repeat) {
	      // in case there's a zero-duration tween that has a repeat with a repeatDelay
	      tTime = _clamp(0, tween._tDur, totalTime);
	      iteration = _animationCycle(tTime, repeatDelay);
	      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
	      if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
	        // if iteration changed
	        prevRatio = 1 - ratio;
	        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
	      }
	    }
	    if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
	      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
	        // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
	        return;
	      }
	      prevIteration = tween._zTime;
	      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

	      suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

	      tween.ratio = ratio;
	      tween._from && (ratio = 1 - ratio);
	      tween._time = 0;
	      tween._tTime = tTime;
	      pt = tween._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	      totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
	      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
	      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
	      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
	        ratio && _removeFromParent(tween, 1);
	        if (!suppressEvents && !_reverting$1) {
	          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
	          tween._prom && tween._prom();
	        }
	      }
	    } else if (!tween._zTime) {
	      tween._zTime = totalTime;
	    }
	  },
	  _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
	    var child;
	    if (time > prevTime) {
	      child = animation._first;
	      while (child && child._start <= time) {
	        if (child.data === "isPause" && child._start > prevTime) {
	          return child;
	        }
	        child = child._next;
	      }
	    } else {
	      child = animation._last;
	      while (child && child._start >= time) {
	        if (child.data === "isPause" && child._start < prevTime) {
	          return child;
	        }
	        child = child._prev;
	      }
	    }
	  },
	  _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
	    var repeat = animation._repeat,
	      dur = _roundPrecise(duration) || 0,
	      totalProgress = animation._tTime / animation._tDur;
	    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
	    animation._dur = dur;
	    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
	    totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
	    animation.parent && _setEnd(animation);
	    skipUncache || _uncache(animation.parent, animation);
	    return animation;
	  },
	  _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
	    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
	  },
	  _zeroPosition = {
	    _start: 0,
	    endTime: _emptyFunc,
	    totalDuration: _emptyFunc
	  },
	  _parsePosition = function _parsePosition(animation, position, percentAnimation) {
	    var labels = animation.labels,
	      recent = animation._recent || _zeroPosition,
	      clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur,
	      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
	      i,
	      offset,
	      isPercent;
	    if (_isString(position) && (isNaN(position) || position in labels)) {
	      //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
	      offset = position.charAt(0);
	      isPercent = position.substr(-1) === "%";
	      i = position.indexOf("=");
	      if (offset === "<" || offset === ">") {
	        i >= 0 && (position = position.replace(/=/, ""));
	        return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
	      }
	      if (i < 0) {
	        position in labels || (labels[position] = clippedDuration);
	        return labels[position];
	      }
	      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
	      if (isPercent && percentAnimation) {
	        offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
	      }
	      return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
	    }
	    return position == null ? clippedDuration : +position;
	  },
	  _createTweenType = function _createTweenType(type, params, timeline) {
	    var isLegacy = _isNumber(params[1]),
	      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
	      vars = params[varsIndex],
	      irVars,
	      parent;
	    isLegacy && (vars.duration = params[1]);
	    vars.parent = timeline;
	    if (type) {
	      irVars = vars;
	      parent = timeline;
	      while (parent && !("immediateRender" in irVars)) {
	        // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
	        irVars = parent.vars.defaults || {};
	        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
	      }
	      vars.immediateRender = _isNotFalse(irVars.immediateRender);
	      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
	    }
	    return new Tween(params[0], vars, params[varsIndex + 1]);
	  },
	  _conditionalReturn = function _conditionalReturn(value, func) {
	    return value || value === 0 ? func(value) : func;
	  },
	  _clamp = function _clamp(min, max, value) {
	    return value < min ? min : value > max ? max : value;
	  },
	  getUnit = function getUnit(value, v) {
	    return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
	  },
	  // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
	  clamp = function clamp(min, max, value) {
	    return _conditionalReturn(value, function (v) {
	      return _clamp(min, max, v);
	    });
	  },
	  _slice = [].slice,
	  _isArrayLike = function _isArrayLike(value, nonEmpty) {
	    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
	  },
	  _flatten = function _flatten(ar, leaveStrings, accumulator) {
	    if (accumulator === void 0) {
	      accumulator = [];
	    }
	    return ar.forEach(function (value) {
	      var _accumulator;
	      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
	    }) || accumulator;
	  },
	  //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
	  toArray = function toArray(value, scope, leaveStrings) {
	    return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
	  },
	  selector = function selector(value) {
	    value = toArray(value)[0] || _warn("Invalid scope") || {};
	    return function (v) {
	      var el = value.current || value.nativeElement || value;
	      return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
	    };
	  },
	  shuffle = function shuffle(a) {
	    return a.sort(function () {
	      return .5 - Math.random();
	    });
	  },
	  // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
	  //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
	  distribute = function distribute(v) {
	    if (_isFunction(v)) {
	      return v;
	    }
	    var vars = _isObject(v) ? v : {
	        each: v
	      },
	      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
	      ease = _parseEase(vars.ease),
	      from = vars.from || 0,
	      base = parseFloat(vars.base) || 0,
	      cache = {},
	      isDecimal = from > 0 && from < 1,
	      ratios = isNaN(from) || isDecimal,
	      axis = vars.axis,
	      ratioX = from,
	      ratioY = from;
	    if (_isString(from)) {
	      ratioX = ratioY = {
	        center: .5,
	        edges: .5,
	        end: 1
	      }[from] || 0;
	    } else if (!isDecimal && ratios) {
	      ratioX = from[0];
	      ratioY = from[1];
	    }
	    return function (i, target, a) {
	      var l = (a || vars).length,
	        distances = cache[l],
	        originX,
	        originY,
	        x,
	        y,
	        d,
	        j,
	        max,
	        min,
	        wrapAt;
	      if (!distances) {
	        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
	        if (!wrapAt) {
	          max = -_bigNum$1;
	          while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}
	          wrapAt--;
	        }
	        distances = cache[l] = [];
	        originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
	        originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
	        max = 0;
	        min = _bigNum$1;
	        for (j = 0; j < l; j++) {
	          x = j % wrapAt - originX;
	          y = originY - (j / wrapAt | 0);
	          distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
	          d > max && (max = d);
	          d < min && (min = d);
	        }
	        from === "random" && shuffle(distances);
	        distances.max = max - min;
	        distances.min = min;
	        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
	        distances.b = l < 0 ? base - l : base;
	        distances.u = getUnit(vars.amount || vars.each) || 0; //unit

	        ease = ease && l < 0 ? _invertEase(ease) : ease;
	      }
	      l = (distances[i] - distances.min) / distances.max || 0;
	      return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
	    };
	  },
	  _roundModifier = function _roundModifier(v) {
	    //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
	    var p = Math.pow(10, ((v + "").split(".")[1] || "").length); //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed())

	    return function (raw) {
	      var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
	      return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
	    };
	  },
	  snap = function snap(snapTo, value) {
	    var isArray = _isArray(snapTo),
	      radius,
	      is2D;
	    if (!isArray && _isObject(snapTo)) {
	      radius = isArray = snapTo.radius || _bigNum$1;
	      if (snapTo.values) {
	        snapTo = toArray(snapTo.values);
	        if (is2D = !_isNumber(snapTo[0])) {
	          radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
	        }
	      } else {
	        snapTo = _roundModifier(snapTo.increment);
	      }
	    }
	    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
	      is2D = snapTo(raw);
	      return Math.abs(is2D - raw) <= radius ? is2D : raw;
	    } : function (raw) {
	      var x = parseFloat(is2D ? raw.x : raw),
	        y = parseFloat(is2D ? raw.y : 0),
	        min = _bigNum$1,
	        closest = 0,
	        i = snapTo.length,
	        dx,
	        dy;
	      while (i--) {
	        if (is2D) {
	          dx = snapTo[i].x - x;
	          dy = snapTo[i].y - y;
	          dx = dx * dx + dy * dy;
	        } else {
	          dx = Math.abs(snapTo[i] - x);
	        }
	        if (dx < min) {
	          min = dx;
	          closest = i;
	        }
	      }
	      closest = !radius || min <= radius ? snapTo[closest] : raw;
	      return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
	    });
	  },
	  random = function random(min, max, roundingIncrement, returnFunction) {
	    return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
	      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
	    });
	  },
	  pipe$1 = function pipe() {
	    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
	      functions[_key] = arguments[_key];
	    }
	    return function (value) {
	      return functions.reduce(function (v, f) {
	        return f(v);
	      }, value);
	    };
	  },
	  unitize = function unitize(func, unit) {
	    return function (value) {
	      return func(parseFloat(value)) + (unit || getUnit(value));
	    };
	  },
	  normalize = function normalize(min, max, value) {
	    return mapRange(min, max, 0, 1, value);
	  },
	  _wrapArray = function _wrapArray(a, wrapper, value) {
	    return _conditionalReturn(value, function (index) {
	      return a[~~wrapper(index)];
	    });
	  },
	  wrap = function wrap(min, max, value) {
	    // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
	    var range = max - min;
	    return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
	      return (range + (value - min) % range) % range + min;
	    });
	  },
	  wrapYoyo = function wrapYoyo(min, max, value) {
	    var range = max - min,
	      total = range * 2;
	    return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
	      value = (total + (value - min) % total) % total || 0;
	      return min + (value > range ? total - value : value);
	    });
	  },
	  _replaceRandom = function _replaceRandom(value) {
	    //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
	    var prev = 0,
	      s = "",
	      i,
	      nums,
	      end,
	      isArray;
	    while (~(i = value.indexOf("random(", prev))) {
	      end = value.indexOf(")", i);
	      isArray = value.charAt(i + 7) === "[";
	      nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
	      s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
	      prev = end + 1;
	    }
	    return s + value.substr(prev, value.length - prev);
	  },
	  mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
	    var inRange = inMax - inMin,
	      outRange = outMax - outMin;
	    return _conditionalReturn(value, function (value) {
	      return outMin + ((value - inMin) / inRange * outRange || 0);
	    });
	  },
	  interpolate = function interpolate(start, end, progress, mutate) {
	    var func = isNaN(start + end) ? 0 : function (p) {
	      return (1 - p) * start + p * end;
	    };
	    if (!func) {
	      var isString = _isString(start),
	        master = {},
	        p,
	        i,
	        interpolators,
	        l,
	        il;
	      progress === true && (mutate = 1) && (progress = null);
	      if (isString) {
	        start = {
	          p: start
	        };
	        end = {
	          p: end
	        };
	      } else if (_isArray(start) && !_isArray(end)) {
	        interpolators = [];
	        l = start.length;
	        il = l - 2;
	        for (i = 1; i < l; i++) {
	          interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
	        }
	        l--;
	        func = function func(p) {
	          p *= l;
	          var i = Math.min(il, ~~p);
	          return interpolators[i](p - i);
	        };
	        progress = end;
	      } else if (!mutate) {
	        start = _merge(_isArray(start) ? [] : {}, start);
	      }
	      if (!interpolators) {
	        for (p in end) {
	          _addPropTween.call(master, start, p, "get", end[p]);
	        }
	        func = function func(p) {
	          return _renderPropTweens(p, master) || (isString ? start.p : start);
	        };
	      }
	    }
	    return _conditionalReturn(progress, func);
	  },
	  _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
	    //used for nextLabel() and previousLabel()
	    var labels = timeline.labels,
	      min = _bigNum$1,
	      p,
	      distance,
	      label;
	    for (p in labels) {
	      distance = labels[p] - fromTime;
	      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
	        label = p;
	        min = distance;
	      }
	    }
	    return label;
	  },
	  _callback = function _callback(animation, type, executeLazyFirst) {
	    var v = animation.vars,
	      callback = v[type],
	      prevContext = _context,
	      context = animation._ctx,
	      params,
	      scope,
	      result;
	    if (!callback) {
	      return;
	    }
	    params = v[type + "Params"];
	    scope = v.callbackScope || animation;
	    executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

	    context && (_context = context);
	    result = params ? callback.apply(scope, params) : callback.call(scope);
	    _context = prevContext;
	    return result;
	  },
	  _interrupt = function _interrupt(animation) {
	    _removeFromParent(animation);
	    animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
	    animation.progress() < 1 && _callback(animation, "onInterrupt");
	    return animation;
	  },
	  _quickTween,
	  _createPlugin = function _createPlugin(config) {
	    config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

	    var name = config.name,
	      isFunc = _isFunction(config),
	      Plugin = name && !isFunc && config.init ? function () {
	        this._props = [];
	      } : config,
	      //in case someone passes in an object that's not a plugin, like CustomEase
	      instanceDefaults = {
	        init: _emptyFunc,
	        render: _renderPropTweens,
	        add: _addPropTween,
	        kill: _killPropTweensOf,
	        modifier: _addPluginModifier,
	        rawVars: 0
	      },
	      statics = {
	        targetTest: 0,
	        get: 0,
	        getSetter: _getSetter,
	        aliases: {},
	        register: 0
	      };
	    _wake();
	    if (config !== Plugin) {
	      if (_plugins[name]) {
	        return;
	      }
	      _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods

	      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods

	      _plugins[Plugin.prop = name] = Plugin;
	      if (config.targetTest) {
	        _harnessPlugins.push(Plugin);
	        _reservedProps[name] = 1;
	      }
	      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
	    }
	    _addGlobal(name, Plugin);
	    config.register && config.register(gsap, Plugin, PropTween);
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * COLORS
	   * --------------------------------------------------------------------------------------
	   */
	  _255 = 255,
	  _colorLookup = {
	    aqua: [0, _255, _255],
	    lime: [0, _255, 0],
	    silver: [192, 192, 192],
	    black: [0, 0, 0],
	    maroon: [128, 0, 0],
	    teal: [0, 128, 128],
	    blue: [0, 0, _255],
	    navy: [0, 0, 128],
	    white: [_255, _255, _255],
	    olive: [128, 128, 0],
	    yellow: [_255, _255, 0],
	    orange: [_255, 165, 0],
	    gray: [128, 128, 128],
	    purple: [128, 0, 128],
	    green: [0, 128, 0],
	    red: [_255, 0, 0],
	    pink: [_255, 192, 203],
	    cyan: [0, _255, _255],
	    transparent: [_255, _255, _255, 0]
	  },
	  // possible future idea to replace the hard-coded color name values - put this in the ticker.wake() where we set the _doc:
	  // let ctx = _doc.createElement("canvas").getContext("2d");
	  // _forEachName("aqua,lime,silver,black,maroon,teal,blue,navy,white,olive,yellow,orange,gray,purple,green,red,pink,cyan", color => {ctx.fillStyle = color; _colorLookup[color] = splitColor(ctx.fillStyle)});
	  _hue = function _hue(h, m1, m2) {
	    h += h < 0 ? 1 : h > 1 ? -1 : 0;
	    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
	  },
	  splitColor = function splitColor(v, toHSL, forceAlpha) {
	    var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
	      r,
	      g,
	      b,
	      h,
	      s,
	      l,
	      max,
	      min,
	      d,
	      wasHSL;
	    if (!a) {
	      if (v.substr(-1) === ",") {
	        //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
	        v = v.substr(0, v.length - 1);
	      }
	      if (_colorLookup[v]) {
	        a = _colorLookup[v];
	      } else if (v.charAt(0) === "#") {
	        if (v.length < 6) {
	          //for shorthand like #9F0 or #9F0F (could have alpha)
	          r = v.charAt(1);
	          g = v.charAt(2);
	          b = v.charAt(3);
	          v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
	        }
	        if (v.length === 9) {
	          // hex with alpha, like #fd5e53ff
	          a = parseInt(v.substr(1, 6), 16);
	          return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
	        }
	        v = parseInt(v.substr(1), 16);
	        a = [v >> 16, v >> 8 & _255, v & _255];
	      } else if (v.substr(0, 3) === "hsl") {
	        a = wasHSL = v.match(_strictNumExp);
	        if (!toHSL) {
	          h = +a[0] % 360 / 360;
	          s = +a[1] / 100;
	          l = +a[2] / 100;
	          g = l <= .5 ? l * (s + 1) : l + s - l * s;
	          r = l * 2 - g;
	          a.length > 3 && (a[3] *= 1); //cast as number

	          a[0] = _hue(h + 1 / 3, r, g);
	          a[1] = _hue(h, r, g);
	          a[2] = _hue(h - 1 / 3, r, g);
	        } else if (~v.indexOf("=")) {
	          //if relative values are found, just return the raw strings with the relative prefixes in place.
	          a = v.match(_numExp);
	          forceAlpha && a.length < 4 && (a[3] = 1);
	          return a;
	        }
	      } else {
	        a = v.match(_strictNumExp) || _colorLookup.transparent;
	      }
	      a = a.map(Number);
	    }
	    if (toHSL && !wasHSL) {
	      r = a[0] / _255;
	      g = a[1] / _255;
	      b = a[2] / _255;
	      max = Math.max(r, g, b);
	      min = Math.min(r, g, b);
	      l = (max + min) / 2;
	      if (max === min) {
	        h = s = 0;
	      } else {
	        d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	        h *= 60;
	      }
	      a[0] = ~~(h + .5);
	      a[1] = ~~(s * 100 + .5);
	      a[2] = ~~(l * 100 + .5);
	    }
	    forceAlpha && a.length < 4 && (a[3] = 1);
	    return a;
	  },
	  _colorOrderData = function _colorOrderData(v) {
	    // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
	    var values = [],
	      c = [],
	      i = -1;
	    v.split(_colorExp).forEach(function (v) {
	      var a = v.match(_numWithUnitExp) || [];
	      values.push.apply(values, a);
	      c.push(i += a.length + 1);
	    });
	    values.c = c;
	    return values;
	  },
	  _formatColors = function _formatColors(s, toHSL, orderMatchData) {
	    var result = "",
	      colors = (s + result).match(_colorExp),
	      type = toHSL ? "hsla(" : "rgba(",
	      i = 0,
	      c,
	      shell,
	      d,
	      l;
	    if (!colors) {
	      return s;
	    }
	    colors = colors.map(function (color) {
	      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
	    });
	    if (orderMatchData) {
	      d = _colorOrderData(s);
	      c = orderMatchData.c;
	      if (c.join(result) !== d.c.join(result)) {
	        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
	        l = shell.length - 1;
	        for (; i < l; i++) {
	          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
	        }
	      }
	    }
	    if (!shell) {
	      shell = s.split(_colorExp);
	      l = shell.length - 1;
	      for (; i < l; i++) {
	        result += shell[i] + colors[i];
	      }
	    }
	    return result + shell[l];
	  },
	  _colorExp = function () {
	    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
	      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
	      p;
	    for (p in _colorLookup) {
	      s += "|" + p + "\\b";
	    }
	    return new RegExp(s + ")", "gi");
	  }(),
	  _hslExp = /hsl[a]?\(/,
	  _colorStringFilter = function _colorStringFilter(a) {
	    var combined = a.join(" "),
	      toHSL;
	    _colorExp.lastIndex = 0;
	    if (_colorExp.test(combined)) {
	      toHSL = _hslExp.test(combined);
	      a[1] = _formatColors(a[1], toHSL);
	      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

	      return true;
	    }
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * TICKER
	   * --------------------------------------------------------------------------------------
	   */
	  _tickerActive,
	  _ticker = function () {
	    var _getTime = Date.now,
	      _lagThreshold = 500,
	      _adjustedLag = 33,
	      _startTime = _getTime(),
	      _lastUpdate = _startTime,
	      _gap = 1000 / 240,
	      _nextTime = _gap,
	      _listeners = [],
	      _id,
	      _req,
	      _raf,
	      _self,
	      _delta,
	      _i,
	      _tick = function _tick(v) {
	        var elapsed = _getTime() - _lastUpdate,
	          manual = v === true,
	          overlap,
	          dispatch,
	          time,
	          frame;
	        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
	        _lastUpdate += elapsed;
	        time = _lastUpdate - _startTime;
	        overlap = time - _nextTime;
	        if (overlap > 0 || manual) {
	          frame = ++_self.frame;
	          _delta = time - _self.time * 1000;
	          _self.time = time = time / 1000;
	          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
	          dispatch = 1;
	        }
	        manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

	        if (dispatch) {
	          for (_i = 0; _i < _listeners.length; _i++) {
	            // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
	            _listeners[_i](time, _delta, frame, v);
	          }
	        }
	      };
	    _self = {
	      time: 0,
	      frame: 0,
	      tick: function tick() {
	        _tick(true);
	      },
	      deltaRatio: function deltaRatio(fps) {
	        return _delta / (1000 / (fps || 60));
	      },
	      wake: function wake() {
	        if (_coreReady) {
	          if (!_coreInitted && _windowExists$1()) {
	            _win$1 = _coreInitted = window;
	            _doc$1 = _win$1.document || {};
	            _globals.gsap = gsap;
	            (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap.version);
	            _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});
	            _raf = _win$1.requestAnimationFrame;
	          }
	          _id && _self.sleep();
	          _req = _raf || function (f) {
	            return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
	          };
	          _tickerActive = 1;
	          _tick(2);
	        }
	      },
	      sleep: function sleep() {
	        (_raf ? _win$1.cancelAnimationFrame : clearTimeout)(_id);
	        _tickerActive = 0;
	        _req = _emptyFunc;
	      },
	      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
	        _lagThreshold = threshold || Infinity; // zero should be interpreted as basically unlimited

	        _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
	      },
	      fps: function fps(_fps) {
	        _gap = 1000 / (_fps || 240);
	        _nextTime = _self.time * 1000 + _gap;
	      },
	      add: function add(callback, once, prioritize) {
	        var func = once ? function (t, d, f, v) {
	          callback(t, d, f, v);
	          _self.remove(func);
	        } : callback;
	        _self.remove(callback);
	        _listeners[prioritize ? "unshift" : "push"](func);
	        _wake();
	        return func;
	      },
	      remove: function remove(callback, i) {
	        ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
	      },
	      _listeners: _listeners
	    };
	    return _self;
	  }(),
	  _wake = function _wake() {
	    return !_tickerActive && _ticker.wake();
	  },
	  //also ensures the core classes are initialized.

	  /*
	  * -------------------------------------------------
	  * EASING
	  * -------------------------------------------------
	  */
	  _easeMap = {},
	  _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
	  _quotesExp = /["']/g,
	  _parseObjectInString = function _parseObjectInString(value) {
	    //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
	    var obj = {},
	      split = value.substr(1, value.length - 3).split(":"),
	      key = split[0],
	      i = 1,
	      l = split.length,
	      index,
	      val,
	      parsedVal;
	    for (; i < l; i++) {
	      val = split[i];
	      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
	      parsedVal = val.substr(0, index);
	      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
	      key = val.substr(index + 1).trim();
	    }
	    return obj;
	  },
	  _valueInParentheses = function _valueInParentheses(value) {
	    var open = value.indexOf("(") + 1,
	      close = value.indexOf(")"),
	      nested = value.indexOf("(", open);
	    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
	  },
	  _configEaseFromString = function _configEaseFromString(name) {
	    //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
	    var split = (name + "").split("("),
	      ease = _easeMap[split[0]];
	    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
	  },
	  _invertEase = function _invertEase(ease) {
	    return function (p) {
	      return 1 - ease(1 - p);
	    };
	  },
	  // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
	  _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
	    var child = timeline._first,
	      ease;
	    while (child) {
	      if (child instanceof Timeline) {
	        _propagateYoyoEase(child, isYoyo);
	      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
	        if (child.timeline) {
	          _propagateYoyoEase(child.timeline, isYoyo);
	        } else {
	          ease = child._ease;
	          child._ease = child._yEase;
	          child._yEase = ease;
	          child._yoyo = isYoyo;
	        }
	      }
	      child = child._next;
	    }
	  },
	  _parseEase = function _parseEase(ease, defaultEase) {
	    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
	  },
	  _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
	    if (easeOut === void 0) {
	      easeOut = function easeOut(p) {
	        return 1 - easeIn(1 - p);
	      };
	    }
	    if (easeInOut === void 0) {
	      easeInOut = function easeInOut(p) {
	        return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
	      };
	    }
	    var ease = {
	        easeIn: easeIn,
	        easeOut: easeOut,
	        easeInOut: easeInOut
	      },
	      lowercaseName;
	    _forEachName(names, function (name) {
	      _easeMap[name] = _globals[name] = ease;
	      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
	      for (var p in ease) {
	        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
	      }
	    });
	    return ease;
	  },
	  _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
	    return function (p) {
	      return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
	    };
	  },
	  _configElastic = function _configElastic(type, amplitude, period) {
	    var p1 = amplitude >= 1 ? amplitude : 1,
	      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
	      p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
	      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
	      easeOut = function easeOut(p) {
	        return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
	      },
	      ease = type === "out" ? easeOut : type === "in" ? function (p) {
	        return 1 - easeOut(1 - p);
	      } : _easeInOutFromOut(easeOut);
	    p2 = _2PI / p2; //precalculate to optimize

	    ease.config = function (amplitude, period) {
	      return _configElastic(type, amplitude, period);
	    };
	    return ease;
	  },
	  _configBack = function _configBack(type, overshoot) {
	    if (overshoot === void 0) {
	      overshoot = 1.70158;
	    }
	    var easeOut = function easeOut(p) {
	        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
	      },
	      ease = type === "out" ? easeOut : type === "in" ? function (p) {
	        return 1 - easeOut(1 - p);
	      } : _easeInOutFromOut(easeOut);
	    ease.config = function (overshoot) {
	      return _configBack(type, overshoot);
	    };
	    return ease;
	  }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
	// _weightedEase = ratio => {
	// 	let y = 0.5 + ratio / 2;
	// 	return p => (2 * (1 - p) * p * y + p * p);
	// },
	// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
	// _weightedEaseStrong = ratio => {
	// 	ratio = .5 + ratio / 2;
	// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
	// 		b = ratio - o,
	// 		c = ratio + o;
	// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
	// };

	_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
	  var power = i < 5 ? i + 1 : i;
	  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
	    return Math.pow(p, power);
	  } : function (p) {
	    return p;
	  }, function (p) {
	    return 1 - Math.pow(1 - p, power);
	  }, function (p) {
	    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
	  });
	});
	_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
	_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
	(function (n, c) {
	  var n1 = 1 / c,
	    n2 = 2 * n1,
	    n3 = 2.5 * n1,
	    easeOut = function easeOut(p) {
	      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
	    };
	  _insertEase("Bounce", function (p) {
	    return 1 - easeOut(1 - p);
	  }, easeOut);
	})(7.5625, 2.75);
	_insertEase("Expo", function (p) {
	  return p ? Math.pow(2, 10 * (p - 1)) : 0;
	});
	_insertEase("Circ", function (p) {
	  return -(_sqrt(1 - p * p) - 1);
	});
	_insertEase("Sine", function (p) {
	  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
	});
	_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
	_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
	  config: function config(steps, immediateStart) {
	    if (steps === void 0) {
	      steps = 1;
	    }
	    var p1 = 1 / steps,
	      p2 = steps + (immediateStart ? 0 : 1),
	      p3 = immediateStart ? 1 : 0,
	      max = 1 - _tinyNum;
	    return function (p) {
	      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
	    };
	  }
	};
	_defaults.ease = _easeMap["quad.out"];
	_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
	  return _callbackNames += name + "," + name + "Params,";
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * CACHE
	 * --------------------------------------------------------------------------------------
	 */

	var GSCache = function GSCache(target, harness) {
	  this.id = _gsID++;
	  target._gsap = this;
	  this.target = target;
	  this.harness = harness;
	  this.get = harness ? harness.get : _getProperty;
	  this.set = harness ? harness.getSetter : _getSetter;
	};
	/*
	 * --------------------------------------------------------------------------------------
	 * ANIMATION
	 * --------------------------------------------------------------------------------------
	 */

	var Animation = /*#__PURE__*/function () {
	  function Animation(vars) {
	    this.vars = vars;
	    this._delay = +vars.delay || 0;
	    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
	      // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
	      this._rDelay = vars.repeatDelay || 0;
	      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
	    }
	    this._ts = 1;
	    _setDuration(this, +vars.duration, 1, 1);
	    this.data = vars.data;
	    if (_context) {
	      this._ctx = _context;
	      _context.data.push(this);
	    }
	    _tickerActive || _ticker.wake();
	  }
	  var _proto = Animation.prototype;
	  _proto.delay = function delay(value) {
	    if (value || value === 0) {
	      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
	      this._delay = value;
	      return this;
	    }
	    return this._delay;
	  };
	  _proto.duration = function duration(value) {
	    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
	  };
	  _proto.totalDuration = function totalDuration(value) {
	    if (!arguments.length) {
	      return this._tDur;
	    }
	    this._dirty = 0;
	    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
	  };
	  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
	    _wake();
	    if (!arguments.length) {
	      return this._tTime;
	    }
	    var parent = this._dp;
	    if (parent && parent.smoothChildTiming && this._ts) {
	      _alignPlayhead(this, _totalTime);
	      !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
	      //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

	      while (parent && parent.parent) {
	        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
	          parent.totalTime(parent._tTime, true);
	        }
	        parent = parent.parent;
	      }
	      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
	        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
	        _addToTimeline(this._dp, this, this._start - this._delay);
	      }
	    }
	    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
	      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
	      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
	      //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
	      //   this._lock = 1;

	      _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
	      //}
	    }
	    return this;
	  };
	  _proto.time = function time(value, suppressEvents) {
	    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
	  };
	  _proto.totalProgress = function totalProgress(value, suppressEvents) {
	    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
	  };
	  _proto.progress = function progress(value, suppressEvents) {
	    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
	  };
	  _proto.iteration = function iteration(value, suppressEvents) {
	    var cycleDuration = this.duration() + this._rDelay;
	    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
	  } // potential future addition:
	  // isPlayingBackwards() {
	  // 	let animation = this,
	  // 		orientation = 1; // 1 = forward, -1 = backward
	  // 	while (animation) {
	  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
	  // 		animation = animation.parent;
	  // 	}
	  // 	return orientation < 0;
	  // }
	  ;
	  _proto.timeScale = function timeScale(value) {
	    if (!arguments.length) {
	      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
	    }
	    if (this._rts === value) {
	      return this;
	    }
	    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
	    // future addition? Up side: fast and minimal file size. Down side: only works on this animation; if a timeline is reversed, for example, its childrens' onReverse wouldn't get called.
	    //(+value < 0 && this._rts >= 0) && _callback(this, "onReverse", true);
	    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

	    this._rts = +value || 0;
	    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

	    this.totalTime(_clamp(-this._delay, this._tDur, tTime), true);
	    _setEnd(this); // if parent.smoothChildTiming was false, the end time didn't get updated in the _alignPlayhead() method, so do it here.

	    return _recacheAncestors(this);
	  };
	  _proto.paused = function paused(value) {
	    if (!arguments.length) {
	      return this._ps;
	    }
	    if (this._ps !== value) {
	      this._ps = value;
	      if (value) {
	        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

	        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
	      } else {
	        _wake();
	        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

	        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum)); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
	      }
	    }
	    return this;
	  };
	  _proto.startTime = function startTime(value) {
	    if (arguments.length) {
	      this._start = value;
	      var parent = this.parent || this._dp;
	      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
	      return this;
	    }
	    return this._start;
	  };
	  _proto.endTime = function endTime(includeRepeats) {
	    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	  };
	  _proto.rawTime = function rawTime(wrapRepeats) {
	    var parent = this.parent || this._dp; // _dp = detached parent

	    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
	  };
	  _proto.revert = function revert(config) {
	    if (config === void 0) {
	      config = _revertConfig;
	    }
	    var prevIsReverting = _reverting$1;
	    _reverting$1 = config;
	    if (this._initted || this._startAt) {
	      this.timeline && this.timeline.revert(config);
	      this.totalTime(-0.01, config.suppressEvents);
	    }
	    this.data !== "nested" && config.kill !== false && this.kill();
	    _reverting$1 = prevIsReverting;
	    return this;
	  };
	  _proto.globalTime = function globalTime(rawTime) {
	    var animation = this,
	      time = arguments.length ? rawTime : animation.rawTime();
	    while (animation) {
	      time = animation._start + time / (animation._ts || 1);
	      animation = animation._dp;
	    }
	    return !this.parent && this._sat ? this._sat.vars.immediateRender ? -1 : this._sat.globalTime(rawTime) : time; // the _startAt tweens for .fromTo() and .from() that have immediateRender should always be FIRST in the timeline (important for context.revert()). "_sat" stands for _startAtTween, referring to the parent tween that created the _startAt. We must discern if that tween had immediateRender so that we can know whether or not to prioritize it in revert().
	  };
	  _proto.repeat = function repeat(value) {
	    if (arguments.length) {
	      this._repeat = value === Infinity ? -2 : value;
	      return _onUpdateTotalDuration(this);
	    }
	    return this._repeat === -2 ? Infinity : this._repeat;
	  };
	  _proto.repeatDelay = function repeatDelay(value) {
	    if (arguments.length) {
	      var time = this._time;
	      this._rDelay = value;
	      _onUpdateTotalDuration(this);
	      return time ? this.time(time) : this;
	    }
	    return this._rDelay;
	  };
	  _proto.yoyo = function yoyo(value) {
	    if (arguments.length) {
	      this._yoyo = value;
	      return this;
	    }
	    return this._yoyo;
	  };
	  _proto.seek = function seek(position, suppressEvents) {
	    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
	  };
	  _proto.restart = function restart(includeDelay, suppressEvents) {
	    return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
	  };
	  _proto.play = function play(from, suppressEvents) {
	    from != null && this.seek(from, suppressEvents);
	    return this.reversed(false).paused(false);
	  };
	  _proto.reverse = function reverse(from, suppressEvents) {
	    from != null && this.seek(from || this.totalDuration(), suppressEvents);
	    return this.reversed(true).paused(false);
	  };
	  _proto.pause = function pause(atTime, suppressEvents) {
	    atTime != null && this.seek(atTime, suppressEvents);
	    return this.paused(true);
	  };
	  _proto.resume = function resume() {
	    return this.paused(false);
	  };
	  _proto.reversed = function reversed(value) {
	    if (arguments.length) {
	      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

	      return this;
	    }
	    return this._rts < 0;
	  };
	  _proto.invalidate = function invalidate() {
	    this._initted = this._act = 0;
	    this._zTime = -_tinyNum;
	    return this;
	  };
	  _proto.isActive = function isActive() {
	    var parent = this.parent || this._dp,
	      start = this._start,
	      rawTime;
	    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
	  };
	  _proto.eventCallback = function eventCallback(type, callback, params) {
	    var vars = this.vars;
	    if (arguments.length > 1) {
	      if (!callback) {
	        delete vars[type];
	      } else {
	        vars[type] = callback;
	        params && (vars[type + "Params"] = params);
	        type === "onUpdate" && (this._onUpdate = callback);
	      }
	      return this;
	    }
	    return vars[type];
	  };
	  _proto.then = function then(onFulfilled) {
	    var self = this;
	    return new Promise(function (resolve) {
	      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
	        _resolve = function _resolve() {
	          var _then = self.then;
	          self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

	          _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
	          resolve(f);
	          self.then = _then;
	        };
	      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
	        _resolve();
	      } else {
	        self._prom = _resolve;
	      }
	    });
	  };
	  _proto.kill = function kill() {
	    _interrupt(this);
	  };
	  return Animation;
	}();
	_setDefaults(Animation.prototype, {
	  _time: 0,
	  _start: 0,
	  _end: 0,
	  _tTime: 0,
	  _tDur: 0,
	  _dirty: 0,
	  _repeat: 0,
	  _yoyo: false,
	  parent: null,
	  _initted: false,
	  _rDelay: 0,
	  _ts: 1,
	  _dp: 0,
	  ratio: 0,
	  _zTime: -_tinyNum,
	  _prom: 0,
	  _ps: false,
	  _rts: 1
	});
	/*
	 * -------------------------------------------------
	 * TIMELINE
	 * -------------------------------------------------
	 */

	var Timeline = /*#__PURE__*/function (_Animation) {
	  _inheritsLoose(Timeline, _Animation);
	  function Timeline(vars, position) {
	    var _this;
	    if (vars === void 0) {
	      vars = {};
	    }
	    _this = _Animation.call(this, vars) || this;
	    _this.labels = {};
	    _this.smoothChildTiming = !!vars.smoothChildTiming;
	    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
	    _this._sort = _isNotFalse(vars.sortChildren);
	    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
	    vars.reversed && _this.reverse();
	    vars.paused && _this.paused(true);
	    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
	    return _this;
	  }
	  var _proto2 = Timeline.prototype;
	  _proto2.to = function to(targets, vars, position) {
	    _createTweenType(0, arguments, this);
	    return this;
	  };
	  _proto2.from = function from(targets, vars, position) {
	    _createTweenType(1, arguments, this);
	    return this;
	  };
	  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
	    _createTweenType(2, arguments, this);
	    return this;
	  };
	  _proto2.set = function set(targets, vars, position) {
	    vars.duration = 0;
	    vars.parent = this;
	    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
	    vars.immediateRender = !!vars.immediateRender;
	    new Tween(targets, vars, _parsePosition(this, position), 1);
	    return this;
	  };
	  _proto2.call = function call(callback, params, position) {
	    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
	  } //ONLY for backward compatibility! Maybe delete?
	  ;
	  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    vars.duration = duration;
	    vars.stagger = vars.stagger || stagger;
	    vars.onComplete = onCompleteAll;
	    vars.onCompleteParams = onCompleteAllParams;
	    vars.parent = this;
	    new Tween(targets, vars, _parsePosition(this, position));
	    return this;
	  };
	  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    vars.runBackwards = 1;
	    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
	    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
	  };
	  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    toVars.startAt = fromVars;
	    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
	    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
	  };
	  _proto2.render = function render(totalTime, suppressEvents, force) {
	    var prevTime = this._time,
	      tDur = this._dirty ? this.totalDuration() : this._tDur,
	      dur = this._dur,
	      tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime),
	      // if a paused timeline is resumed (or its _start is updated for another reason...which rounds it), that could result in the playhead shifting a **tiny** amount and a zero-duration child at that spot may get rendered at a different ratio, like its totalTime in render() may be 1e-17 instead of 0, for example.
	      crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
	      time,
	      child,
	      next,
	      iteration,
	      cycleDuration,
	      prevPaused,
	      pauseTween,
	      timeScale,
	      prevStart,
	      prevIteration,
	      yoyo,
	      isYoyo;
	    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
	    if (tTime !== this._tTime || force || crossingStart) {
	      if (prevTime !== this._time && dur) {
	        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
	        tTime += this._time - prevTime;
	        totalTime += this._time - prevTime;
	      }
	      time = tTime;
	      prevStart = this._start;
	      timeScale = this._ts;
	      prevPaused = !timeScale;
	      if (crossingStart) {
	        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

	        (totalTime || !suppressEvents) && (this._zTime = totalTime);
	      }
	      if (this._repeat) {
	        //adjust the time for repeats and yoyos
	        yoyo = this._yoyo;
	        cycleDuration = dur + this._rDelay;
	        if (this._repeat < -1 && totalTime < 0) {
	          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
	        }
	        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

	        if (tTime === tDur) {
	          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
	          iteration = this._repeat;
	          time = dur;
	        } else {
	          iteration = ~~(tTime / cycleDuration);
	          if (iteration && iteration === tTime / cycleDuration) {
	            time = dur;
	            iteration--;
	          }
	          time > dur && (time = dur);
	        }
	        prevIteration = _animationCycle(this._tTime, cycleDuration);
	        !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

	        if (yoyo && iteration & 1) {
	          time = dur - time;
	          isYoyo = 1;
	        }
	        /*
	        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
	        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
	        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
	        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
	        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
	        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
	        */

	        if (iteration !== prevIteration && !this._lock) {
	          var rewinding = yoyo && prevIteration & 1,
	            doesWrap = rewinding === (yoyo && iteration & 1);
	          iteration < prevIteration && (rewinding = !rewinding);
	          prevTime = rewinding ? 0 : dur;
	          this._lock = 1;
	          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
	          this._tTime = tTime; // if a user gets the iteration() inside the onRepeat, for example, it should be accurate.

	          !suppressEvents && this.parent && _callback(this, "onRepeat");
	          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
	          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
	            // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
	            return this;
	          }
	          dur = this._dur; // in case the duration changed in the onRepeat

	          tDur = this._tDur;
	          if (doesWrap) {
	            this._lock = 2;
	            prevTime = rewinding ? dur : -0.0001;
	            this.render(prevTime, true);
	            this.vars.repeatRefresh && !isYoyo && this.invalidate();
	          }
	          this._lock = 0;
	          if (!this._ts && !prevPaused) {
	            return this;
	          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.

	          _propagateYoyoEase(this, isYoyo);
	        }
	      }
	      if (this._hasPause && !this._forcing && this._lock < 2) {
	        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
	        if (pauseTween) {
	          tTime -= time - (time = pauseTween._start);
	        }
	      }
	      this._tTime = tTime;
	      this._time = time;
	      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

	      if (!this._initted) {
	        this._onUpdate = this.vars.onUpdate;
	        this._initted = 1;
	        this._zTime = totalTime;
	        prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
	      }
	      if (!prevTime && time && !suppressEvents) {
	        _callback(this, "onStart");
	        if (this._tTime !== tTime) {
	          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
	          return this;
	        }
	      }
	      if (time >= prevTime && totalTime >= 0) {
	        child = this._first;
	        while (child) {
	          next = child._next;
	          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
	            if (child.parent !== this) {
	              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
	              return this.render(totalTime, suppressEvents, force);
	            }
	            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
	            if (time !== this._time || !this._ts && !prevPaused) {
	              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
	              pauseTween = 0;
	              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

	              break;
	            }
	          }
	          child = next;
	        }
	      } else {
	        child = this._last;
	        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

	        while (child) {
	          next = child._prev;
	          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
	            if (child.parent !== this) {
	              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
	              return this.render(totalTime, suppressEvents, force);
	            }
	            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && (child._initted || child._startAt)); // if reverting, we should always force renders of initted tweens (but remember that .fromTo() or .from() may have a _startAt but not _initted yet). If, for example, a .fromTo() tween with a stagger (which creates an internal timeline) gets reverted BEFORE some of its child tweens render for the first time, it may not properly trigger them to revert.

	            if (time !== this._time || !this._ts && !prevPaused) {
	              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
	              pauseTween = 0;
	              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

	              break;
	            }
	          }
	          child = next;
	        }
	      }
	      if (pauseTween && !suppressEvents) {
	        this.pause();
	        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
	        if (this._ts) {
	          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
	          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

	          _setEnd(this);
	          return this.render(totalTime, suppressEvents, force);
	        }
	      }
	      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
	      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
	        // remember, a child's callback may alter this timeline's playhead or timeScale which is why we need to add some of these checks.
	        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

	        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
	          _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
	          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
	        }
	      }
	    }
	    return this;
	  };
	  _proto2.add = function add(child, position) {
	    var _this2 = this;
	    _isNumber(position) || (position = _parsePosition(this, position, child));
	    if (!(child instanceof Animation)) {
	      if (_isArray(child)) {
	        child.forEach(function (obj) {
	          return _this2.add(obj, position);
	        });
	        return this;
	      }
	      if (_isString(child)) {
	        return this.addLabel(child, position);
	      }
	      if (_isFunction(child)) {
	        child = Tween.delayedCall(0, child);
	      } else {
	        return this;
	      }
	    }
	    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
	  };
	  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
	    if (nested === void 0) {
	      nested = true;
	    }
	    if (tweens === void 0) {
	      tweens = true;
	    }
	    if (timelines === void 0) {
	      timelines = true;
	    }
	    if (ignoreBeforeTime === void 0) {
	      ignoreBeforeTime = -_bigNum$1;
	    }
	    var a = [],
	      child = this._first;
	    while (child) {
	      if (child._start >= ignoreBeforeTime) {
	        if (child instanceof Tween) {
	          tweens && a.push(child);
	        } else {
	          timelines && a.push(child);
	          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
	        }
	      }
	      child = child._next;
	    }
	    return a;
	  };
	  _proto2.getById = function getById(id) {
	    var animations = this.getChildren(1, 1, 1),
	      i = animations.length;
	    while (i--) {
	      if (animations[i].vars.id === id) {
	        return animations[i];
	      }
	    }
	  };
	  _proto2.remove = function remove(child) {
	    if (_isString(child)) {
	      return this.removeLabel(child);
	    }
	    if (_isFunction(child)) {
	      return this.killTweensOf(child);
	    }
	    _removeLinkedListItem(this, child);
	    if (child === this._recent) {
	      this._recent = this._last;
	    }
	    return _uncache(this);
	  };
	  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
	    if (!arguments.length) {
	      return this._tTime;
	    }
	    this._forcing = 1;
	    if (!this._dp && this._ts) {
	      //special case for the global timeline (or any other that has no parent or detached parent).
	      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
	    }
	    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
	    this._forcing = 0;
	    return this;
	  };
	  _proto2.addLabel = function addLabel(label, position) {
	    this.labels[label] = _parsePosition(this, position);
	    return this;
	  };
	  _proto2.removeLabel = function removeLabel(label) {
	    delete this.labels[label];
	    return this;
	  };
	  _proto2.addPause = function addPause(position, callback, params) {
	    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
	    t.data = "isPause";
	    this._hasPause = 1;
	    return _addToTimeline(this, t, _parsePosition(this, position));
	  };
	  _proto2.removePause = function removePause(position) {
	    var child = this._first;
	    position = _parsePosition(this, position);
	    while (child) {
	      if (child._start === position && child.data === "isPause") {
	        _removeFromParent(child);
	      }
	      child = child._next;
	    }
	  };
	  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
	    var tweens = this.getTweensOf(targets, onlyActive),
	      i = tweens.length;
	    while (i--) {
	      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
	    }
	    return this;
	  };
	  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
	    var a = [],
	      parsedTargets = toArray(targets),
	      child = this._first,
	      isGlobalTime = _isNumber(onlyActive),
	      // a number is interpreted as a global time. If the animation spans
	      children;
	    while (child) {
	      if (child instanceof Tween) {
	        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
	          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
	          a.push(child);
	        }
	      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
	        a.push.apply(a, children);
	      }
	      child = child._next;
	    }
	    return a;
	  } // potential future feature - targets() on timelines
	  // targets() {
	  // 	let result = [];
	  // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
	  // 	return result.filter((v, i) => result.indexOf(v) === i);
	  // }
	  ;
	  _proto2.tweenTo = function tweenTo(position, vars) {
	    vars = vars || {};
	    var tl = this,
	      endTime = _parsePosition(tl, position),
	      _vars = vars,
	      startAt = _vars.startAt,
	      _onStart = _vars.onStart,
	      onStartParams = _vars.onStartParams,
	      immediateRender = _vars.immediateRender,
	      initted,
	      tween = Tween.to(tl, _setDefaults({
	        ease: vars.ease || "none",
	        lazy: false,
	        immediateRender: false,
	        time: endTime,
	        overwrite: "auto",
	        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
	        onStart: function onStart() {
	          tl.pause();
	          if (!initted) {
	            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
	            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
	            initted = 1;
	          }
	          _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
	        }
	      }, vars));
	    return immediateRender ? tween.render(0) : tween;
	  };
	  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
	    return this.tweenTo(toPosition, _setDefaults({
	      startAt: {
	        time: _parsePosition(this, fromPosition)
	      }
	    }, vars));
	  };
	  _proto2.recent = function recent() {
	    return this._recent;
	  };
	  _proto2.nextLabel = function nextLabel(afterTime) {
	    if (afterTime === void 0) {
	      afterTime = this._time;
	    }
	    return _getLabelInDirection(this, _parsePosition(this, afterTime));
	  };
	  _proto2.previousLabel = function previousLabel(beforeTime) {
	    if (beforeTime === void 0) {
	      beforeTime = this._time;
	    }
	    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
	  };
	  _proto2.currentLabel = function currentLabel(value) {
	    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
	  };
	  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
	    if (ignoreBeforeTime === void 0) {
	      ignoreBeforeTime = 0;
	    }
	    var child = this._first,
	      labels = this.labels,
	      p;
	    while (child) {
	      if (child._start >= ignoreBeforeTime) {
	        child._start += amount;
	        child._end += amount;
	      }
	      child = child._next;
	    }
	    if (adjustLabels) {
	      for (p in labels) {
	        if (labels[p] >= ignoreBeforeTime) {
	          labels[p] += amount;
	        }
	      }
	    }
	    return _uncache(this);
	  };
	  _proto2.invalidate = function invalidate(soft) {
	    var child = this._first;
	    this._lock = 0;
	    while (child) {
	      child.invalidate(soft);
	      child = child._next;
	    }
	    return _Animation.prototype.invalidate.call(this, soft);
	  };
	  _proto2.clear = function clear(includeLabels) {
	    if (includeLabels === void 0) {
	      includeLabels = true;
	    }
	    var child = this._first,
	      next;
	    while (child) {
	      next = child._next;
	      this.remove(child);
	      child = next;
	    }
	    this._dp && (this._time = this._tTime = this._pTime = 0);
	    includeLabels && (this.labels = {});
	    return _uncache(this);
	  };
	  _proto2.totalDuration = function totalDuration(value) {
	    var max = 0,
	      self = this,
	      child = self._last,
	      prevStart = _bigNum$1,
	      prev,
	      start,
	      parent;
	    if (arguments.length) {
	      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
	    }
	    if (self._dirty) {
	      parent = self.parent;
	      while (child) {
	        prev = child._prev; //record it here in case the tween changes position in the sequence...

	        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

	        start = child._start;
	        if (start > prevStart && self._sort && child._ts && !self._lock) {
	          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
	          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

	          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
	        } else {
	          prevStart = start;
	        }
	        if (start < 0 && child._ts) {
	          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
	          max -= start;
	          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
	            self._start += start / self._ts;
	            self._time -= start;
	            self._tTime -= start;
	          }
	          self.shiftChildren(-start, false, -1e999);
	          prevStart = 0;
	        }
	        child._end > max && child._ts && (max = child._end);
	        child = prev;
	      }
	      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);
	      self._dirty = 0;
	    }
	    return self._tDur;
	  };
	  Timeline.updateRoot = function updateRoot(time) {
	    if (_globalTimeline._ts) {
	      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
	      _lastRenderedFrame = _ticker.frame;
	    }
	    if (_ticker.frame >= _nextGCFrame) {
	      _nextGCFrame += _config.autoSleep || 120;
	      var child = _globalTimeline._first;
	      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
	        while (child && !child._ts) {
	          child = child._next;
	        }
	        child || _ticker.sleep();
	      }
	    }
	  };
	  return Timeline;
	}(Animation);
	_setDefaults(Timeline.prototype, {
	  _lock: 0,
	  _hasPause: 0,
	  _forcing: 0
	});
	var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
	    //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
	    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
	      index = 0,
	      matchIndex = 0,
	      result,
	      startNums,
	      color,
	      endNum,
	      chunk,
	      startNum,
	      hasRandom,
	      a;
	    pt.b = start;
	    pt.e = end;
	    start += ""; //ensure values are strings

	    end += "";
	    if (hasRandom = ~end.indexOf("random(")) {
	      end = _replaceRandom(end);
	    }
	    if (stringFilter) {
	      a = [start, end];
	      stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

	      start = a[0];
	      end = a[1];
	    }
	    startNums = start.match(_complexStringNumExp) || [];
	    while (result = _complexStringNumExp.exec(end)) {
	      endNum = result[0];
	      chunk = end.substring(index, result.index);
	      if (color) {
	        color = (color + 1) % 5;
	      } else if (chunk.substr(-5) === "rgba(") {
	        color = 1;
	      }
	      if (endNum !== startNums[matchIndex++]) {
	        startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

	        pt._pt = {
	          _next: pt._pt,
	          p: chunk || matchIndex === 1 ? chunk : ",",
	          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
	          s: startNum,
	          c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
	          m: color && color < 4 ? Math.round : 0
	        };
	        index = _complexStringNumExp.lastIndex;
	      }
	    }
	    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

	    pt.fp = funcParam;
	    if (_relExp.test(end) || hasRandom) {
	      pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
	    }
	    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

	    return pt;
	  },
	  _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
	    _isFunction(end) && (end = end(index || 0, target, targets));
	    var currentValue = target[prop],
	      parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
	      setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
	      pt;
	    if (_isString(end)) {
	      if (~end.indexOf("random(")) {
	        end = _replaceRandom(end);
	      }
	      if (end.charAt(1) === "=") {
	        pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
	        if (pt || pt === 0) {
	          // to avoid isNaN, like if someone passes in a value like "!= whatever"
	          end = pt;
	        }
	      }
	    }
	    if (!optional || parsedStart !== end || _forceAllPropTweens) {
	      if (!isNaN(parsedStart * end) && end !== "") {
	        // fun fact: any number multiplied by "" is evaluated as the number 0!
	        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
	        funcParam && (pt.fp = funcParam);
	        modifier && pt.modifier(modifier, this, target);
	        return this._pt = pt;
	      }
	      !currentValue && !(prop in target) && _missingPlugin(prop, end);
	      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
	    }
	  },
	  //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
	  _processVars = function _processVars(vars, index, target, targets, tween) {
	    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
	    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
	      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
	    }
	    var copy = {},
	      p;
	    for (p in vars) {
	      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
	    }
	    return copy;
	  },
	  _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
	    var plugin, pt, ptLookup, i;
	    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
	      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
	      if (tween !== _quickTween) {
	        ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

	        i = plugin._props.length;
	        while (i--) {
	          ptLookup[plugin._props[i]] = pt;
	        }
	      }
	    }
	    return plugin;
	  },
	  _overwritingTween,
	  //store a reference temporarily so we can avoid overwriting itself.
	  _forceAllPropTweens,
	  _initTween = function _initTween(tween, time, tTime) {
	    var vars = tween.vars,
	      ease = vars.ease,
	      startAt = vars.startAt,
	      immediateRender = vars.immediateRender,
	      lazy = vars.lazy,
	      onUpdate = vars.onUpdate,
	      onUpdateParams = vars.onUpdateParams,
	      callbackScope = vars.callbackScope,
	      runBackwards = vars.runBackwards,
	      yoyoEase = vars.yoyoEase,
	      keyframes = vars.keyframes,
	      autoRevert = vars.autoRevert,
	      dur = tween._dur,
	      prevStartAt = tween._startAt,
	      targets = tween._targets,
	      parent = tween.parent,
	      fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets,
	      autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites,
	      tl = tween.timeline,
	      cleanVars,
	      i,
	      p,
	      pt,
	      target,
	      hasPriority,
	      gsData,
	      harness,
	      plugin,
	      ptLookup,
	      index,
	      harnessVars,
	      overwritten;
	    tl && (!keyframes || !ease) && (ease = "none");
	    tween._ease = _parseEase(ease, _defaults.ease);
	    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
	    if (yoyoEase && tween._yoyo && !tween._repeat) {
	      //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
	      yoyoEase = tween._yEase;
	      tween._yEase = tween._ease;
	      tween._ease = yoyoEase;
	    }
	    tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

	    if (!tl || keyframes && !vars.stagger) {
	      //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
	      harness = targets[0] ? _getCache(targets[0]).harness : 0;
	      harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

	      cleanVars = _copyExcluding(vars, _reservedProps);
	      if (prevStartAt) {
	        prevStartAt._zTime < 0 && prevStartAt.progress(1); // in case it's a lazy startAt that hasn't rendered yet.

	        time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig); // if it's a "startAt" (not "from()" or runBackwards: true), we only need to do a shallow revert (keep transforms cached in CSSPlugin)
	        // don't just _removeFromParent(prevStartAt.render(-1, true)) because that'll leave inline styles. We're creating a new _startAt for "startAt" tweens that re-capture things to ensure that if the pre-tween values changed since the tween was created, they're recorded.

	        prevStartAt._lazy = 0;
	      }
	      if (startAt) {
	        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
	          data: "isStart",
	          overwrite: false,
	          parent: parent,
	          immediateRender: true,
	          lazy: !prevStartAt && _isNotFalse(lazy),
	          startAt: null,
	          delay: 0,
	          onUpdate: onUpdate,
	          onUpdateParams: onUpdateParams,
	          callbackScope: callbackScope,
	          stagger: 0
	        }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);

	        tween._startAt._dp = 0; // don't allow it to get put back into root timeline! Like when revert() is called and totalTime() gets set.

	        tween._startAt._sat = tween; // used in globalTime(). _sat stands for _startAtTween

	        time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill); // rare edge case, like if a render is forced in the negative direction of a non-initted tween.

	        if (immediateRender) {
	          if (dur && time <= 0 && tTime <= 0) {
	            // check tTime here because in the case of a yoyo tween whose playhead gets pushed to the end like tween.progress(1), we should allow it through so that the onComplete gets fired properly.
	            time && (tween._zTime = time);
	            return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
	          }
	        }
	      } else if (runBackwards && dur) {
	        //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
	        if (!prevStartAt) {
	          time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

	          p = _setDefaults({
	            overwrite: false,
	            data: "isFromStart",
	            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
	            lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
	            immediateRender: immediateRender,
	            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
	            stagger: 0,
	            parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})
	          }, cleanVars);
	          harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

	          _removeFromParent(tween._startAt = Tween.set(targets, p));
	          tween._startAt._dp = 0; // don't allow it to get put back into root timeline!

	          tween._startAt._sat = tween; // used in globalTime()

	          time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
	          tween._zTime = time;
	          if (!immediateRender) {
	            _initTween(tween._startAt, _tinyNum, _tinyNum); //ensures that the initial values are recorded
	          } else if (!time) {
	            return;
	          }
	        }
	      }
	      tween._pt = tween._ptCache = 0;
	      lazy = dur && _isNotFalse(lazy) || lazy && !dur;
	      for (i = 0; i < targets.length; i++) {
	        target = targets[i];
	        gsData = target._gsap || _harness(targets)[i]._gsap;
	        tween._ptLookup[i] = ptLookup = {};
	        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

	        index = fullTargets === targets ? i : fullTargets.indexOf(target);
	        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
	          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
	          plugin._props.forEach(function (name) {
	            ptLookup[name] = pt;
	          });
	          plugin.priority && (hasPriority = 1);
	        }
	        if (!harness || harnessVars) {
	          for (p in cleanVars) {
	            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
	              plugin.priority && (hasPriority = 1);
	            } else {
	              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
	            }
	          }
	        }
	        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
	        if (autoOverwrite && tween._pt) {
	          _overwritingTween = tween;
	          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time)); // make sure the overwriting doesn't overwrite THIS tween!!!

	          overwritten = !tween.parent;
	          _overwritingTween = 0;
	        }
	        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
	      }
	      hasPriority && _sortPropTweensByPriority(tween);
	      tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
	    }
	    tween._onUpdate = onUpdate;
	    tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.

	    keyframes && time <= 0 && tl.render(_bigNum$1, true, true); // if there's a 0% keyframe, it'll render in the "before" state for any staggered/delayed animations thus when the following tween initializes, it'll use the "before" state instead of the "after" state as the initial values.
	  },
	  _updatePropTweens = function _updatePropTweens(tween, property, value, start, startIsRelative, ratio, time) {
	    var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property],
	      pt,
	      rootPT,
	      lookup,
	      i;
	    if (!ptCache) {
	      ptCache = tween._ptCache[property] = [];
	      lookup = tween._ptLookup;
	      i = tween._targets.length;
	      while (i--) {
	        pt = lookup[i][property];
	        if (pt && pt.d && pt.d._pt) {
	          // it's a plugin, so find the nested PropTween
	          pt = pt.d._pt;
	          while (pt && pt.p !== property && pt.fp !== property) {
	            // "fp" is functionParam for things like setting CSS variables which require .setProperty("--var-name", value)
	            pt = pt._next;
	          }
	        }
	        if (!pt) {
	          // there is no PropTween associated with that property, so we must FORCE one to be created and ditch out of this
	          // if the tween has other properties that already rendered at new positions, we'd normally have to rewind to put them back like tween.render(0, true) before forcing an _initTween(), but that can create another edge case like tweening a timeline's progress would trigger onUpdates to fire which could move other things around. It's better to just inform users that .resetTo() should ONLY be used for tweens that already have that property. For example, you can't gsap.to(...{ y: 0 }) and then tween.restTo("x", 200) for example.
	          _forceAllPropTweens = 1; // otherwise, when we _addPropTween() and it finds no change between the start and end values, it skips creating a PropTween (for efficiency...why tween when there's no difference?) but in this case we NEED that PropTween created so we can edit it.

	          tween.vars[property] = "+=0";
	          _initTween(tween, time);
	          _forceAllPropTweens = 0;
	          return 1;
	        }
	        ptCache.push(pt);
	      }
	    }
	    i = ptCache.length;
	    while (i--) {
	      rootPT = ptCache[i];
	      pt = rootPT._pt || rootPT; // complex values may have nested PropTweens. We only accommodate the FIRST value.

	      pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
	      pt.c = value - pt.s;
	      rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e)); // mainly for CSSPlugin (end value)

	      rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b)); // (beginning value)
	    }
	  },
	  _addAliasesToVars = function _addAliasesToVars(targets, vars) {
	    var harness = targets[0] ? _getCache(targets[0]).harness : 0,
	      propertyAliases = harness && harness.aliases,
	      copy,
	      p,
	      i,
	      aliases;
	    if (!propertyAliases) {
	      return vars;
	    }
	    copy = _merge({}, vars);
	    for (p in propertyAliases) {
	      if (p in copy) {
	        aliases = propertyAliases[p].split(",");
	        i = aliases.length;
	        while (i--) {
	          copy[aliases[i]] = copy[p];
	        }
	      }
	    }
	    return copy;
	  },
	  // parses multiple formats, like {"0%": {x: 100}, {"50%": {x: -20}} and { x: {"0%": 100, "50%": -20} }, and an "ease" can be set on any object. We populate an "allProps" object with an Array for each property, like {x: [{}, {}], y:[{}, {}]} with data for each property tween. The objects have a "t" (time), "v", (value), and "e" (ease) property. This allows us to piece together a timeline later.
	  _parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
	    var ease = obj.ease || easeEach || "power1.inOut",
	      p,
	      a;
	    if (_isArray(obj)) {
	      a = allProps[prop] || (allProps[prop] = []); // t = time (out of 100), v = value, e = ease

	      obj.forEach(function (value, i) {
	        return a.push({
	          t: i / (obj.length - 1) * 100,
	          v: value,
	          e: ease
	        });
	      });
	    } else {
	      for (p in obj) {
	        a = allProps[p] || (allProps[p] = []);
	        p === "ease" || a.push({
	          t: parseFloat(prop),
	          v: obj[p],
	          e: ease
	        });
	      }
	    }
	  },
	  _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
	    return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
	  },
	  _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
	  _staggerPropsToSkip = {};
	_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function (name) {
	  return _staggerPropsToSkip[name] = 1;
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * TWEEN
	 * --------------------------------------------------------------------------------------
	 */

	var Tween = /*#__PURE__*/function (_Animation2) {
	  _inheritsLoose(Tween, _Animation2);
	  function Tween(targets, vars, position, skipInherit) {
	    var _this3;
	    if (typeof vars === "number") {
	      position.duration = vars;
	      vars = position;
	      position = null;
	    }
	    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
	    var _this3$vars = _this3.vars,
	      duration = _this3$vars.duration,
	      delay = _this3$vars.delay,
	      immediateRender = _this3$vars.immediateRender,
	      stagger = _this3$vars.stagger,
	      overwrite = _this3$vars.overwrite,
	      keyframes = _this3$vars.keyframes,
	      defaults = _this3$vars.defaults,
	      scrollTrigger = _this3$vars.scrollTrigger,
	      yoyoEase = _this3$vars.yoyoEase,
	      parent = vars.parent || _globalTimeline,
	      parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
	      tl,
	      i,
	      copy,
	      l,
	      p,
	      curTarget,
	      staggerFunc,
	      staggerVarsToMerge;
	    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
	    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

	    _this3._overwrite = overwrite;
	    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
	      vars = _this3.vars;
	      tl = _this3.timeline = new Timeline({
	        data: "nested",
	        defaults: defaults || {},
	        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
	      }); // we need to store the targets because for staggers and keyframes, we end up creating an individual tween for each but function-based values need to know the index and the whole Array of targets.

	      tl.kill();
	      tl.parent = tl._dp = _assertThisInitialized(_this3);
	      tl._start = 0;
	      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
	        l = parsedTargets.length;
	        staggerFunc = stagger && distribute(stagger);
	        if (_isObject(stagger)) {
	          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
	          for (p in stagger) {
	            if (~_staggerTweenProps.indexOf(p)) {
	              staggerVarsToMerge || (staggerVarsToMerge = {});
	              staggerVarsToMerge[p] = stagger[p];
	            }
	          }
	        }
	        for (i = 0; i < l; i++) {
	          copy = _copyExcluding(vars, _staggerPropsToSkip);
	          copy.stagger = 0;
	          yoyoEase && (copy.yoyoEase = yoyoEase);
	          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
	          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

	          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
	          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
	          if (!stagger && l === 1 && copy.delay) {
	            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
	            _this3._delay = delay = copy.delay;
	            _this3._start += delay;
	            copy.delay = 0;
	          }
	          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
	          tl._ease = _easeMap.none;
	        }
	        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
	      } else if (keyframes) {
	        _inheritDefaults(_setDefaults(tl.vars.defaults, {
	          ease: "none"
	        }));
	        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
	        var time = 0,
	          a,
	          kf,
	          v;
	        if (_isArray(keyframes)) {
	          keyframes.forEach(function (frame) {
	            return tl.to(parsedTargets, frame, ">");
	          });
	          tl.duration(); // to ensure tl._dur is cached because we tap into it for performance purposes in the render() method.
	        } else {
	          copy = {};
	          for (p in keyframes) {
	            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
	          }
	          for (p in copy) {
	            a = copy[p].sort(function (a, b) {
	              return a.t - b.t;
	            });
	            time = 0;
	            for (i = 0; i < a.length; i++) {
	              kf = a[i];
	              v = {
	                ease: kf.e,
	                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
	              };
	              v[p] = kf.v;
	              tl.to(parsedTargets, v, time);
	              time += v.duration;
	            }
	          }
	          tl.duration() < duration && tl.to({}, {
	            duration: duration - tl.duration()
	          }); // in case keyframes didn't go to 100%
	        }
	      }
	      duration || _this3.duration(duration = tl.duration());
	    } else {
	      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
	    }
	    if (overwrite === true && !_suppressOverwrites) {
	      _overwritingTween = _assertThisInitialized(_this3);
	      _globalTimeline.killTweensOf(parsedTargets);
	      _overwritingTween = 0;
	    }
	    _addToTimeline(parent, _assertThisInitialized(_this3), position);
	    vars.reversed && _this3.reverse();
	    vars.paused && _this3.paused(true);
	    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
	      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

	      _this3.render(Math.max(0, -delay) || 0); //in case delay is negative
	    }
	    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
	    return _this3;
	  }
	  var _proto3 = Tween.prototype;
	  _proto3.render = function render(totalTime, suppressEvents, force) {
	    var prevTime = this._time,
	      tDur = this._tDur,
	      dur = this._dur,
	      isNegative = totalTime < 0,
	      tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime,
	      time,
	      pt,
	      iteration,
	      cycleDuration,
	      prevIteration,
	      isYoyo,
	      ratio,
	      timeline,
	      yoyoEase;
	    if (!dur) {
	      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
	    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative) {
	      //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
	      time = tTime;
	      timeline = this.timeline;
	      if (this._repeat) {
	        //adjust the time for repeats and yoyos
	        cycleDuration = dur + this._rDelay;
	        if (this._repeat < -1 && isNegative) {
	          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
	        }
	        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

	        if (tTime === tDur) {
	          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
	          iteration = this._repeat;
	          time = dur;
	        } else {
	          iteration = ~~(tTime / cycleDuration);
	          if (iteration && iteration === tTime / cycleDuration) {
	            time = dur;
	            iteration--;
	          }
	          time > dur && (time = dur);
	        }
	        isYoyo = this._yoyo && iteration & 1;
	        if (isYoyo) {
	          yoyoEase = this._yEase;
	          time = dur - time;
	        }
	        prevIteration = _animationCycle(this._tTime, cycleDuration);
	        if (time === prevTime && !force && this._initted) {
	          //could be during the repeatDelay part. No need to render and fire callbacks.
	          this._tTime = tTime;
	          return this;
	        }
	        if (iteration !== prevIteration) {
	          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

	          if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
	            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

	            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
	          }
	        }
	      }
	      if (!this._initted) {
	        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
	          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

	          return this;
	        }
	        if (prevTime !== this._time) {
	          // rare edge case - during initialization, an onUpdate in the _startAt (.fromTo()) might force this tween to render at a different spot in which case we should ditch this render() call so that it doesn't revert the values.
	          return this;
	        }
	        if (dur !== this._dur) {
	          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
	          return this.render(totalTime, suppressEvents, force);
	        }
	      }
	      this._tTime = tTime;
	      this._time = time;
	      if (!this._act && this._ts) {
	        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

	        this._lazy = 0;
	      }
	      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
	      if (this._from) {
	        this.ratio = ratio = 1 - ratio;
	      }
	      if (time && !prevTime && !suppressEvents) {
	        _callback(this, "onStart");
	        if (this._tTime !== tTime) {
	          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
	          return this;
	        }
	      }
	      pt = this._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	      timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
	      if (this._onUpdate && !suppressEvents) {
	        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

	        _callback(this, "onUpdate");
	      }
	      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
	      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
	        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
	        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

	        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
	          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
	          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
	          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
	        }
	      }
	    }
	    return this;
	  };
	  _proto3.targets = function targets() {
	    return this._targets;
	  };
	  _proto3.invalidate = function invalidate(soft) {
	    // "soft" gives us a way to clear out everything EXCEPT the recorded pre-"from" portion of from() tweens. Otherwise, for example, if you tween.progress(1).render(0, true true).invalidate(), the "from" values would persist and then on the next render, the from() tweens would initialize and the current value would match the "from" values, thus animate from the same value to the same value (no animation). We tap into this in ScrollTrigger's refresh() where we must push a tween to completion and then back again but honor its init state in case the tween is dependent on another tween further up on the page.
	    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
	    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
	    this._ptLookup = [];
	    this.timeline && this.timeline.invalidate(soft);
	    return _Animation2.prototype.invalidate.call(this, soft);
	  };
	  _proto3.resetTo = function resetTo(property, value, start, startIsRelative) {
	    _tickerActive || _ticker.wake();
	    this._ts || this.play();
	    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts),
	      ratio;
	    this._initted || _initTween(this, time);
	    ratio = this._ease(time / this._dur); // don't just get tween.ratio because it may not have rendered yet.
	    // possible future addition to allow an object with multiple values to update, like tween.resetTo({x: 100, y: 200}); At this point, it doesn't seem worth the added kb given the fact that most users will likely opt for the convenient gsap.quickTo() way of interacting with this method.
	    // if (_isObject(property)) { // performance optimization
	    // 	for (p in property) {
	    // 		if (_updatePropTweens(this, p, property[p], value ? value[p] : null, start, ratio, time)) {
	    // 			return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
	    // 		}
	    // 	}
	    // } else {

	    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time)) {
	      return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
	    } //}

	    _alignPlayhead(this, 0);
	    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
	    return this.render(0);
	  };
	  _proto3.kill = function kill(targets, vars) {
	    if (vars === void 0) {
	      vars = "all";
	    }
	    if (!targets && (!vars || vars === "all")) {
	      this._lazy = this._pt = 0;
	      return this.parent ? _interrupt(this) : this;
	    }
	    if (this.timeline) {
	      var tDur = this.timeline.totalDuration();
	      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

	      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

	      return this;
	    }
	    var parsedTargets = this._targets,
	      killingTargets = targets ? toArray(targets) : parsedTargets,
	      propTweenLookup = this._ptLookup,
	      firstPT = this._pt,
	      overwrittenProps,
	      curLookup,
	      curOverwriteProps,
	      props,
	      p,
	      pt,
	      i;
	    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
	      vars === "all" && (this._pt = 0);
	      return _interrupt(this);
	    }
	    overwrittenProps = this._op = this._op || [];
	    if (vars !== "all") {
	      //so people can pass in a comma-delimited list of property names
	      if (_isString(vars)) {
	        p = {};
	        _forEachName(vars, function (name) {
	          return p[name] = 1;
	        });
	        vars = p;
	      }
	      vars = _addAliasesToVars(parsedTargets, vars);
	    }
	    i = parsedTargets.length;
	    while (i--) {
	      if (~killingTargets.indexOf(parsedTargets[i])) {
	        curLookup = propTweenLookup[i];
	        if (vars === "all") {
	          overwrittenProps[i] = vars;
	          props = curLookup;
	          curOverwriteProps = {};
	        } else {
	          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
	          props = vars;
	        }
	        for (p in props) {
	          pt = curLookup && curLookup[p];
	          if (pt) {
	            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
	              _removeLinkedListItem(this, pt, "_pt");
	            }
	            delete curLookup[p];
	          }
	          if (curOverwriteProps !== "all") {
	            curOverwriteProps[p] = 1;
	          }
	        }
	      }
	    }
	    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

	    return this;
	  };
	  Tween.to = function to(targets, vars) {
	    return new Tween(targets, vars, arguments[2]);
	  };
	  Tween.from = function from(targets, vars) {
	    return _createTweenType(1, arguments);
	  };
	  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
	    return new Tween(callback, 0, {
	      immediateRender: false,
	      lazy: false,
	      overwrite: false,
	      delay: delay,
	      onComplete: callback,
	      onReverseComplete: callback,
	      onCompleteParams: params,
	      onReverseCompleteParams: params,
	      callbackScope: scope
	    }); // we must use onReverseComplete too for things like timeline.add(() => {...}) which should be triggered in BOTH directions (forward and reverse)
	  };
	  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
	    return _createTweenType(2, arguments);
	  };
	  Tween.set = function set(targets, vars) {
	    vars.duration = 0;
	    vars.repeatDelay || (vars.repeat = 0);
	    return new Tween(targets, vars);
	  };
	  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
	    return _globalTimeline.killTweensOf(targets, props, onlyActive);
	  };
	  return Tween;
	}(Animation);
	_setDefaults(Tween.prototype, {
	  _targets: [],
	  _lazy: 0,
	  _startAt: 0,
	  _op: 0,
	  _onInit: 0
	}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
	// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
	// 	Tween.prototype[name] = function() {
	// 		let tl = new Timeline();
	// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
	// 	}
	// });
	//for backward compatibility. Leverage the timeline calls.

	_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
	  Tween[name] = function () {
	    var tl = new Timeline(),
	      params = _slice.call(arguments, 0);
	    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
	    return tl[name].apply(tl, params);
	  };
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * PROPTWEEN
	 * --------------------------------------------------------------------------------------
	 */

	var _setterPlain = function _setterPlain(target, property, value) {
	    return target[property] = value;
	  },
	  _setterFunc = function _setterFunc(target, property, value) {
	    return target[property](value);
	  },
	  _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
	    return target[property](data.fp, value);
	  },
	  _setterAttribute = function _setterAttribute(target, property, value) {
	    return target.setAttribute(property, value);
	  },
	  _getSetter = function _getSetter(target, property) {
	    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
	  },
	  _renderPlain = function _renderPlain(ratio, data) {
	    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1000000) / 1000000, data);
	  },
	  _renderBoolean = function _renderBoolean(ratio, data) {
	    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
	  },
	  _renderComplexString = function _renderComplexString(ratio, data) {
	    var pt = data._pt,
	      s = "";
	    if (!ratio && data.b) {
	      //b = beginning string
	      s = data.b;
	    } else if (ratio === 1 && data.e) {
	      //e = ending string
	      s = data.e;
	    } else {
	      while (pt) {
	        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

	        pt = pt._next;
	      }
	      s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
	    }
	    data.set(data.t, data.p, s, data);
	  },
	  _renderPropTweens = function _renderPropTweens(ratio, data) {
	    var pt = data._pt;
	    while (pt) {
	      pt.r(ratio, pt.d);
	      pt = pt._next;
	    }
	  },
	  _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
	    var pt = this._pt,
	      next;
	    while (pt) {
	      next = pt._next;
	      pt.p === property && pt.modifier(modifier, tween, target);
	      pt = next;
	    }
	  },
	  _killPropTweensOf = function _killPropTweensOf(property) {
	    var pt = this._pt,
	      hasNonDependentRemaining,
	      next;
	    while (pt) {
	      next = pt._next;
	      if (pt.p === property && !pt.op || pt.op === property) {
	        _removeLinkedListItem(this, pt, "_pt");
	      } else if (!pt.dep) {
	        hasNonDependentRemaining = 1;
	      }
	      pt = next;
	    }
	    return !hasNonDependentRemaining;
	  },
	  _setterWithModifier = function _setterWithModifier(target, property, value, data) {
	    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
	  },
	  _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
	    var pt = parent._pt,
	      next,
	      pt2,
	      first,
	      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

	    while (pt) {
	      next = pt._next;
	      pt2 = first;
	      while (pt2 && pt2.pr > pt.pr) {
	        pt2 = pt2._next;
	      }
	      if (pt._prev = pt2 ? pt2._prev : last) {
	        pt._prev._next = pt;
	      } else {
	        first = pt;
	      }
	      if (pt._next = pt2) {
	        pt2._prev = pt;
	      } else {
	        last = pt;
	      }
	      pt = next;
	    }
	    parent._pt = first;
	  }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)

	var PropTween = /*#__PURE__*/function () {
	  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
	    this.t = target;
	    this.s = start;
	    this.c = change;
	    this.p = prop;
	    this.r = renderer || _renderPlain;
	    this.d = data || this;
	    this.set = setter || _setterPlain;
	    this.pr = priority || 0;
	    this._next = next;
	    if (next) {
	      next._prev = this;
	    }
	  }
	  var _proto4 = PropTween.prototype;
	  _proto4.modifier = function modifier(func, tween, target) {
	    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

	    this.set = _setterWithModifier;
	    this.m = func;
	    this.mt = target; //modifier target

	    this.tween = tween;
	  };
	  return PropTween;
	}(); //Initialization tasks

	_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
	  return _reservedProps[name] = 1;
	});
	_globals.TweenMax = _globals.TweenLite = Tween;
	_globals.TimelineLite = _globals.TimelineMax = Timeline;
	_globalTimeline = new Timeline({
	  sortChildren: false,
	  defaults: _defaults,
	  autoRemoveChildren: true,
	  id: "root",
	  smoothChildTiming: true
	});
	_config.stringFilter = _colorStringFilter;
	var _media = [],
	  _listeners = {},
	  _emptyArray = [],
	  _lastMediaTime = 0,
	  _dispatch = function _dispatch(type) {
	    return (_listeners[type] || _emptyArray).map(function (f) {
	      return f();
	    });
	  },
	  _onMediaChange = function _onMediaChange() {
	    var time = Date.now(),
	      matches = [];
	    if (time - _lastMediaTime > 2) {
	      _dispatch("matchMediaInit");
	      _media.forEach(function (c) {
	        var queries = c.queries,
	          conditions = c.conditions,
	          match,
	          p,
	          anyMatch,
	          toggled;
	        for (p in queries) {
	          match = _win$1.matchMedia(queries[p]).matches; // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.

	          match && (anyMatch = 1);
	          if (match !== conditions[p]) {
	            conditions[p] = match;
	            toggled = 1;
	          }
	        }
	        if (toggled) {
	          c.revert();
	          anyMatch && matches.push(c);
	        }
	      });
	      _dispatch("matchMediaRevert");
	      matches.forEach(function (c) {
	        return c.onMatch(c);
	      });
	      _lastMediaTime = time;
	      _dispatch("matchMedia");
	    }
	  };
	var Context = /*#__PURE__*/function () {
	  function Context(func, scope) {
	    this.selector = scope && selector(scope);
	    this.data = [];
	    this._r = []; // returned/cleanup functions

	    this.isReverted = false;
	    func && this.add(func);
	  }
	  var _proto5 = Context.prototype;
	  _proto5.add = function add(name, func, scope) {
	    // possible future addition if we need the ability to add() an animation to a context and for whatever reason cannot create that animation inside of a context.add(() => {...}) function.
	    // if (name && _isFunction(name.revert)) {
	    // 	this.data.push(name);
	    // 	return (name._ctx = this);
	    // }
	    if (_isFunction(name)) {
	      scope = func;
	      func = name;
	      name = _isFunction;
	    }
	    var self = this,
	      f = function f() {
	        var prev = _context,
	          prevSelector = self.selector,
	          result;
	        prev && prev !== self && prev.data.push(self);
	        scope && (self.selector = selector(scope));
	        _context = self;
	        result = func.apply(self, arguments);
	        _isFunction(result) && self._r.push(result);
	        _context = prev;
	        self.selector = prevSelector;
	        self.isReverted = false;
	        return result;
	      };
	    self.last = f;
	    return name === _isFunction ? f(self) : name ? self[name] = f : f;
	  };
	  _proto5.ignore = function ignore(func) {
	    var prev = _context;
	    _context = null;
	    func(this);
	    _context = prev;
	  };
	  _proto5.getTweens = function getTweens() {
	    var a = [];
	    this.data.forEach(function (e) {
	      return e instanceof Context ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
	    });
	    return a;
	  };
	  _proto5.clear = function clear() {
	    this._r.length = this.data.length = 0;
	  };
	  _proto5.kill = function kill(revert, matchMedia) {
	    var _this4 = this;
	    if (revert) {
	      var tweens = this.getTweens();
	      this.data.forEach(function (t) {
	        // Flip plugin tweens are very different in that they should actually be pushed to their end. The plugin replaces the timeline's .revert() method to do exactly that. But we also need to remove any of those nested tweens inside the flip timeline so that they don't get individually reverted.
	        if (t.data === "isFlip") {
	          t.revert();
	          t.getChildren(true, true, false).forEach(function (tween) {
	            return tweens.splice(tweens.indexOf(tween), 1);
	          });
	        }
	      }); // save as an object so that we can cache the globalTime for each tween to optimize performance during the sort

	      tweens.map(function (t) {
	        return {
	          g: t.globalTime(0),
	          t: t
	        };
	      }).sort(function (a, b) {
	        return b.g - a.g || -1;
	      }).forEach(function (o) {
	        return o.t.revert(revert);
	      }); // note: all of the _startAt tweens should be reverted in reverse order that they were created, and they'll all have the same globalTime (-1) so the " || -1" in the sort keeps the order properly.

	      this.data.forEach(function (e) {
	        return !(e instanceof Animation) && e.revert && e.revert(revert);
	      });
	      this._r.forEach(function (f) {
	        return f(revert, _this4);
	      });
	      this.isReverted = true;
	    } else {
	      this.data.forEach(function (e) {
	        return e.kill && e.kill();
	      });
	    }
	    this.clear();
	    if (matchMedia) {
	      var i = _media.indexOf(this);
	      !!~i && _media.splice(i, 1);
	    }
	  };
	  _proto5.revert = function revert(config) {
	    this.kill(config || {});
	  };
	  return Context;
	}();
	var MatchMedia = /*#__PURE__*/function () {
	  function MatchMedia(scope) {
	    this.contexts = [];
	    this.scope = scope;
	  }
	  var _proto6 = MatchMedia.prototype;
	  _proto6.add = function add(conditions, func, scope) {
	    _isObject(conditions) || (conditions = {
	      matches: conditions
	    });
	    var context = new Context(0, scope || this.scope),
	      cond = context.conditions = {},
	      mq,
	      p,
	      active;
	    this.contexts.push(context);
	    func = context.add("onMatch", func);
	    context.queries = conditions;
	    for (p in conditions) {
	      if (p === "all") {
	        active = 1;
	      } else {
	        mq = _win$1.matchMedia(conditions[p]);
	        if (mq) {
	          _media.indexOf(context) < 0 && _media.push(context);
	          (cond[p] = mq.matches) && (active = 1);
	          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
	        }
	      }
	    }
	    active && func(context);
	    return this;
	  } // refresh() {
	  // 	let time = _lastMediaTime,
	  // 		media = _media;
	  // 	_lastMediaTime = -1;
	  // 	_media = this.contexts;
	  // 	_onMediaChange();
	  // 	_lastMediaTime = time;
	  // 	_media = media;
	  // }
	  ;
	  _proto6.revert = function revert(config) {
	    this.kill(config || {});
	  };
	  _proto6.kill = function kill(revert) {
	    this.contexts.forEach(function (c) {
	      return c.kill(revert, true);
	    });
	  };
	  return MatchMedia;
	}();
	/*
	 * --------------------------------------------------------------------------------------
	 * GSAP
	 * --------------------------------------------------------------------------------------
	 */

	var _gsap = {
	  registerPlugin: function registerPlugin() {
	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }
	    args.forEach(function (config) {
	      return _createPlugin(config);
	    });
	  },
	  timeline: function timeline(vars) {
	    return new Timeline(vars);
	  },
	  getTweensOf: function getTweensOf(targets, onlyActive) {
	    return _globalTimeline.getTweensOf(targets, onlyActive);
	  },
	  getProperty: function getProperty(target, property, unit, uncache) {
	    _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

	    var getter = _getCache(target || {}).get,
	      format = unit ? _passThrough : _numericIfPossible;
	    unit === "native" && (unit = "");
	    return !target ? target : !property ? function (property, unit, uncache) {
	      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
	    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
	  },
	  quickSetter: function quickSetter(target, property, unit) {
	    target = toArray(target);
	    if (target.length > 1) {
	      var setters = target.map(function (t) {
	          return gsap.quickSetter(t, property, unit);
	        }),
	        l = setters.length;
	      return function (value) {
	        var i = l;
	        while (i--) {
	          setters[i](value);
	        }
	      };
	    }
	    target = target[0] || {};
	    var Plugin = _plugins[property],
	      cache = _getCache(target),
	      p = cache.harness && (cache.harness.aliases || {})[property] || property,
	      // in case it's an alias, like "rotate" for "rotation".
	      setter = Plugin ? function (value) {
	        var p = new Plugin();
	        _quickTween._pt = 0;
	        p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
	        p.render(1, p);
	        _quickTween._pt && _renderPropTweens(1, _quickTween);
	      } : cache.set(target, p);
	    return Plugin ? setter : function (value) {
	      return setter(target, p, unit ? value + unit : value, cache, 1);
	    };
	  },
	  quickTo: function quickTo(target, property, vars) {
	    var _merge2;
	    var tween = gsap.to(target, _merge((_merge2 = {}, _merge2[property] = "+=0.1", _merge2.paused = true, _merge2), vars || {})),
	      func = function func(value, start, startIsRelative) {
	        return tween.resetTo(property, value, start, startIsRelative);
	      };
	    func.tween = tween;
	    return func;
	  },
	  isTweening: function isTweening(targets) {
	    return _globalTimeline.getTweensOf(targets, true).length > 0;
	  },
	  defaults: function defaults(value) {
	    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
	    return _mergeDeep(_defaults, value || {});
	  },
	  config: function config(value) {
	    return _mergeDeep(_config, value || {});
	  },
	  registerEffect: function registerEffect(_ref3) {
	    var name = _ref3.name,
	      effect = _ref3.effect,
	      plugins = _ref3.plugins,
	      defaults = _ref3.defaults,
	      extendTimeline = _ref3.extendTimeline;
	    (plugins || "").split(",").forEach(function (pluginName) {
	      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
	    });
	    _effects[name] = function (targets, vars, tl) {
	      return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
	    };
	    if (extendTimeline) {
	      Timeline.prototype[name] = function (targets, vars, position) {
	        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
	      };
	    }
	  },
	  registerEase: function registerEase(name, ease) {
	    _easeMap[name] = _parseEase(ease);
	  },
	  parseEase: function parseEase(ease, defaultEase) {
	    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
	  },
	  getById: function getById(id) {
	    return _globalTimeline.getById(id);
	  },
	  exportRoot: function exportRoot(vars, includeDelayedCalls) {
	    if (vars === void 0) {
	      vars = {};
	    }
	    var tl = new Timeline(vars),
	      child,
	      next;
	    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
	    _globalTimeline.remove(tl);
	    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

	    tl._time = tl._tTime = _globalTimeline._time;
	    child = _globalTimeline._first;
	    while (child) {
	      next = child._next;
	      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
	        _addToTimeline(tl, child, child._start - child._delay);
	      }
	      child = next;
	    }
	    _addToTimeline(_globalTimeline, tl, 0);
	    return tl;
	  },
	  context: function context(func, scope) {
	    return func ? new Context(func, scope) : _context;
	  },
	  matchMedia: function matchMedia(scope) {
	    return new MatchMedia(scope);
	  },
	  matchMediaRefresh: function matchMediaRefresh() {
	    return _media.forEach(function (c) {
	      var cond = c.conditions,
	        found,
	        p;
	      for (p in cond) {
	        if (cond[p]) {
	          cond[p] = false;
	          found = 1;
	        }
	      }
	      found && c.revert();
	    }) || _onMediaChange();
	  },
	  addEventListener: function addEventListener(type, callback) {
	    var a = _listeners[type] || (_listeners[type] = []);
	    ~a.indexOf(callback) || a.push(callback);
	  },
	  removeEventListener: function removeEventListener(type, callback) {
	    var a = _listeners[type],
	      i = a && a.indexOf(callback);
	    i >= 0 && a.splice(i, 1);
	  },
	  utils: {
	    wrap: wrap,
	    wrapYoyo: wrapYoyo,
	    distribute: distribute,
	    random: random,
	    snap: snap,
	    normalize: normalize,
	    getUnit: getUnit,
	    clamp: clamp,
	    splitColor: splitColor,
	    toArray: toArray,
	    selector: selector,
	    mapRange: mapRange,
	    pipe: pipe$1,
	    unitize: unitize,
	    interpolate: interpolate,
	    shuffle: shuffle
	  },
	  install: _install,
	  effects: _effects,
	  ticker: _ticker,
	  updateRoot: Timeline.updateRoot,
	  plugins: _plugins,
	  globalTimeline: _globalTimeline,
	  core: {
	    PropTween: PropTween,
	    globals: _addGlobal,
	    Tween: Tween,
	    Timeline: Timeline,
	    Animation: Animation,
	    getCache: _getCache,
	    _removeLinkedListItem: _removeLinkedListItem,
	    reverting: function reverting() {
	      return _reverting$1;
	    },
	    context: function context(toAdd) {
	      if (toAdd && _context) {
	        _context.data.push(toAdd);
	        toAdd._ctx = _context;
	      }
	      return _context;
	    },
	    suppressOverwrites: function suppressOverwrites(value) {
	      return _suppressOverwrites = value;
	    }
	  }
	};
	_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
	  return _gsap[name] = Tween[name];
	});
	_ticker.add(Timeline.updateRoot);
	_quickTween = _gsap.to({}, {
	  duration: 0
	}); // ---- EXTRA PLUGINS --------------------------------------------------------

	var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
	    var pt = plugin._pt;
	    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
	      pt = pt._next;
	    }
	    return pt;
	  },
	  _addModifiers = function _addModifiers(tween, modifiers) {
	    var targets = tween._targets,
	      p,
	      i,
	      pt;
	    for (p in modifiers) {
	      i = targets.length;
	      while (i--) {
	        pt = tween._ptLookup[i][p];
	        if (pt && (pt = pt.d)) {
	          if (pt._pt) {
	            // is a plugin
	            pt = _getPluginPropTween(pt, p);
	          }
	          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
	        }
	      }
	    }
	  },
	  _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
	    return {
	      name: name,
	      rawVars: 1,
	      //don't pre-process function-based values or "random()" strings.
	      init: function init(target, vars, tween) {
	        tween._onInit = function (tween) {
	          var temp, p;
	          if (_isString(vars)) {
	            temp = {};
	            _forEachName(vars, function (name) {
	              return temp[name] = 1;
	            }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.

	            vars = temp;
	          }
	          if (modifier) {
	            temp = {};
	            for (p in vars) {
	              temp[p] = modifier(vars[p]);
	            }
	            vars = temp;
	          }
	          _addModifiers(tween, vars);
	        };
	      }
	    };
	  }; //register core plugins

	var gsap = _gsap.registerPlugin({
	  name: "attr",
	  init: function init(target, vars, tween, index, targets) {
	    var p, pt, v;
	    this.tween = tween;
	    for (p in vars) {
	      v = target.getAttribute(p) || "";
	      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
	      pt.op = p;
	      pt.b = v; // record the beginning value so we can revert()

	      this._props.push(p);
	    }
	  },
	  render: function render(ratio, data) {
	    var pt = data._pt;
	    while (pt) {
	      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d); // if reverting, go back to the original (pt.b)

	      pt = pt._next;
	    }
	  }
	}, {
	  name: "endArray",
	  init: function init(target, value) {
	    var i = value.length;
	    while (i--) {
	      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
	    }
	  }
	}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

	Tween.version = Timeline.version = gsap.version = "3.11.4";
	_coreReady = 1;
	_windowExists$1() && _wake();
	_easeMap.Power0;
	  _easeMap.Power1;
	  _easeMap.Power2;
	  _easeMap.Power3;
	  _easeMap.Power4;
	  _easeMap.Linear;
	  _easeMap.Quad;
	  _easeMap.Cubic;
	  _easeMap.Quart;
	  _easeMap.Quint;
	  _easeMap.Strong;
	  _easeMap.Elastic;
	  _easeMap.Back;
	  _easeMap.SteppedEase;
	  _easeMap.Bounce;
	  _easeMap.Sine;
	  _easeMap.Expo;
	  _easeMap.Circ;

	/*!
	 * CSSPlugin 3.11.4
	 * https://greensock.com
	 *
	 * Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	var _win,
	  _doc,
	  _docElement,
	  _pluginInitted,
	  _tempDiv,
	  _recentSetterPlugin,
	  _reverting,
	  _windowExists = function _windowExists() {
	    return typeof window !== "undefined";
	  },
	  _transformProps = {},
	  _RAD2DEG = 180 / Math.PI,
	  _DEG2RAD = Math.PI / 180,
	  _atan2 = Math.atan2,
	  _bigNum = 1e8,
	  _capsExp = /([A-Z])/g,
	  _horizontalExp = /(left|right|width|margin|padding|x)/i,
	  _complexExp = /[\s,\(]\S/,
	  _propertyAliases = {
	    autoAlpha: "opacity,visibility",
	    scale: "scaleX,scaleY",
	    alpha: "opacity"
	  },
	  _renderCSSProp = function _renderCSSProp(ratio, data) {
	    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
	  },
	  _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
	    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
	  },
	  _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
	    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
	  },
	  //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
	  _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
	    var value = data.s + data.c * ratio;
	    data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
	  },
	  _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
	    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
	  },
	  _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
	    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
	  },
	  _setterCSSStyle = function _setterCSSStyle(target, property, value) {
	    return target.style[property] = value;
	  },
	  _setterCSSProp = function _setterCSSProp(target, property, value) {
	    return target.style.setProperty(property, value);
	  },
	  _setterTransform = function _setterTransform(target, property, value) {
	    return target._gsap[property] = value;
	  },
	  _setterScale = function _setterScale(target, property, value) {
	    return target._gsap.scaleX = target._gsap.scaleY = value;
	  },
	  _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
	    var cache = target._gsap;
	    cache.scaleX = cache.scaleY = value;
	    cache.renderTransform(ratio, cache);
	  },
	  _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
	    var cache = target._gsap;
	    cache[property] = value;
	    cache.renderTransform(ratio, cache);
	  },
	  _transformProp = "transform",
	  _transformOriginProp = _transformProp + "Origin",
	  _saveStyle = function _saveStyle(property, isNotCSS) {
	    var _this = this;
	    var target = this.target,
	      style = target.style;
	    if (property in _transformProps) {
	      this.tfm = this.tfm || {};
	      if (property !== "transform") {
	        property = _propertyAliases[property] || property;
	        ~property.indexOf(",") ? property.split(",").forEach(function (a) {
	          return _this.tfm[a] = _get(target, a);
	        }) : this.tfm[property] = target._gsap.x ? target._gsap[property] : _get(target, property); // note: scale would map to "scaleX,scaleY", thus we loop and apply them both.
	      }
	      if (this.props.indexOf(_transformProp) >= 0) {
	        return;
	      }
	      if (target._gsap.svg) {
	        this.svgo = target.getAttribute("data-svg-origin");
	        this.props.push(_transformOriginProp, isNotCSS, "");
	      }
	      property = _transformProp;
	    }
	    (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
	  },
	  _removeIndependentTransforms = function _removeIndependentTransforms(style) {
	    if (style.translate) {
	      style.removeProperty("translate");
	      style.removeProperty("scale");
	      style.removeProperty("rotate");
	    }
	  },
	  _revertStyle = function _revertStyle() {
	    var props = this.props,
	      target = this.target,
	      style = target.style,
	      cache = target._gsap,
	      i,
	      p;
	    for (i = 0; i < props.length; i += 3) {
	      // stored like this: property, isNotCSS, value
	      props[i + 1] ? target[props[i]] = props[i + 2] : props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].replace(_capsExp, "-$1").toLowerCase());
	    }
	    if (this.tfm) {
	      for (p in this.tfm) {
	        cache[p] = this.tfm[p];
	      }
	      if (cache.svg) {
	        cache.renderTransform();
	        target.setAttribute("data-svg-origin", this.svgo || "");
	      }
	      i = _reverting();
	      if (i && !i.isStart && !style[_transformProp]) {
	        _removeIndependentTransforms(style);
	        cache.uncache = 1; // if it's a startAt that's being reverted in the _initTween() of the core, we don't need to uncache transforms. This is purely a performance optimization.
	      }
	    }
	  },
	  _getStyleSaver = function _getStyleSaver(target, properties) {
	    var saver = {
	      target: target,
	      props: [],
	      revert: _revertStyle,
	      save: _saveStyle
	    };
	    properties && properties.split(",").forEach(function (p) {
	      return saver.save(p);
	    });
	    return saver;
	  },
	  _supports3D,
	  _createElement = function _createElement(type, ns) {
	    var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

	    return e.style ? e : _doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
	  },
	  _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
	    var cs = getComputedStyle(target);
	    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
	  },
	  _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
	  _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
	    var e = element || _tempDiv,
	      s = e.style,
	      i = 5;
	    if (property in s && !preferPrefix) {
	      return property;
	    }
	    property = property.charAt(0).toUpperCase() + property.substr(1);
	    while (i-- && !(_prefixes[i] + property in s)) {}
	    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
	  },
	  _initCore = function _initCore() {
	    if (_windowExists() && window.document) {
	      _win = window;
	      _doc = _win.document;
	      _docElement = _doc.documentElement;
	      _tempDiv = _createElement("div") || {
	        style: {}
	      };
	      _createElement("div");
	      _transformProp = _checkPropPrefix(_transformProp);
	      _transformOriginProp = _transformProp + "Origin";
	      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

	      _supports3D = !!_checkPropPrefix("perspective");
	      _reverting = gsap.core.reverting;
	      _pluginInitted = 1;
	    }
	  },
	  _getBBoxHack = function _getBBoxHack(swapIfPossible) {
	    //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
	    var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
	      oldParent = this.parentNode,
	      oldSibling = this.nextSibling,
	      oldCSS = this.style.cssText,
	      bbox;
	    _docElement.appendChild(svg);
	    svg.appendChild(this);
	    this.style.display = "block";
	    if (swapIfPossible) {
	      try {
	        bbox = this.getBBox();
	        this._gsapBBox = this.getBBox; //store the original

	        this.getBBox = _getBBoxHack;
	      } catch (e) {}
	    } else if (this._gsapBBox) {
	      bbox = this._gsapBBox();
	    }
	    if (oldParent) {
	      if (oldSibling) {
	        oldParent.insertBefore(this, oldSibling);
	      } else {
	        oldParent.appendChild(this);
	      }
	    }
	    _docElement.removeChild(svg);
	    this.style.cssText = oldCSS;
	    return bbox;
	  },
	  _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
	    var i = attributesArray.length;
	    while (i--) {
	      if (target.hasAttribute(attributesArray[i])) {
	        return target.getAttribute(attributesArray[i]);
	      }
	    }
	  },
	  _getBBox = function _getBBox(target) {
	    var bounds;
	    try {
	      bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
	    } catch (error) {
	      bounds = _getBBoxHack.call(target, true);
	    }
	    bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

	    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
	      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
	      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
	      width: 0,
	      height: 0
	    } : bounds;
	  },
	  _isSVG = function _isSVG(e) {
	    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
	  },
	  //reports if the element is an SVG on which getBBox() actually works
	  _removeProperty = function _removeProperty(target, property) {
	    if (property) {
	      var style = target.style;
	      if (property in _transformProps && property !== _transformOriginProp) {
	        property = _transformProp;
	      }
	      if (style.removeProperty) {
	        if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
	          //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
	          property = "-" + property;
	        }
	        style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
	      } else {
	        //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
	        style.removeAttribute(property);
	      }
	    }
	  },
	  _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
	    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
	    plugin._pt = pt;
	    pt.b = beginning;
	    pt.e = end;
	    plugin._props.push(property);
	    return pt;
	  },
	  _nonConvertibleUnits = {
	    deg: 1,
	    rad: 1,
	    turn: 1
	  },
	  _nonStandardLayouts = {
	    grid: 1,
	    flex: 1
	  },
	  //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
	  _convertToUnit = function _convertToUnit(target, property, value, unit) {
	    var curValue = parseFloat(value) || 0,
	      curUnit = (value + "").trim().substr((curValue + "").length) || "px",
	      // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
	      style = _tempDiv.style,
	      horizontal = _horizontalExp.test(property),
	      isRootSVG = target.tagName.toLowerCase() === "svg",
	      measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
	      amount = 100,
	      toPixels = unit === "px",
	      toPercent = unit === "%",
	      px,
	      parent,
	      cache,
	      isSVG;
	    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
	      return curValue;
	    }
	    curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
	    isSVG = target.getCTM && _isSVG(target);
	    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
	      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
	      return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
	    }
	    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
	    parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
	    if (isSVG) {
	      parent = (target.ownerSVGElement || {}).parentNode;
	    }
	    if (!parent || parent === _doc || !parent.appendChild) {
	      parent = _doc.body;
	    }
	    cache = parent._gsap;
	    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
	      return _round(curValue / cache.width * amount);
	    } else {
	      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
	      parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

	      parent.appendChild(_tempDiv);
	      px = _tempDiv[measureProperty];
	      parent.removeChild(_tempDiv);
	      style.position = "absolute";
	      if (horizontal && toPercent) {
	        cache = _getCache(parent);
	        cache.time = _ticker.time;
	        cache.width = parent[measureProperty];
	      }
	    }
	    return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
	  },
	  _get = function _get(target, property, unit, uncache) {
	    var value;
	    _pluginInitted || _initCore();
	    if (property in _propertyAliases && property !== "transform") {
	      property = _propertyAliases[property];
	      if (~property.indexOf(",")) {
	        property = property.split(",")[0];
	      }
	    }
	    if (_transformProps[property] && property !== "transform") {
	      value = _parseTransform(target, uncache);
	      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
	    } else {
	      value = target.style[property];
	      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
	        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
	      }
	    }
	    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
	  },
	  _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
	    // note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
	    if (!start || start === "none") {
	      // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
	      var p = _checkPropPrefix(prop, target, 1),
	        s = p && _getComputedProperty(target, p, 1);
	      if (s && s !== start) {
	        prop = p;
	        start = s;
	      } else if (prop === "borderColor") {
	        start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
	      }
	    }
	    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
	      index = 0,
	      matchIndex = 0,
	      a,
	      result,
	      startValues,
	      startNum,
	      color,
	      startValue,
	      endValue,
	      endNum,
	      chunk,
	      endUnit,
	      startUnit,
	      endValues;
	    pt.b = start;
	    pt.e = end;
	    start += ""; // ensure values are strings

	    end += "";
	    if (end === "auto") {
	      target.style[prop] = end;
	      end = _getComputedProperty(target, prop) || end;
	      target.style[prop] = start;
	    }
	    a = [start, end];
	    _colorStringFilter(a); // pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().

	    start = a[0];
	    end = a[1];
	    startValues = start.match(_numWithUnitExp) || [];
	    endValues = end.match(_numWithUnitExp) || [];
	    if (endValues.length) {
	      while (result = _numWithUnitExp.exec(end)) {
	        endValue = result[0];
	        chunk = end.substring(index, result.index);
	        if (color) {
	          color = (color + 1) % 5;
	        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
	          color = 1;
	        }
	        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
	          startNum = parseFloat(startValue) || 0;
	          startUnit = startValue.substr((startNum + "").length);
	          endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
	          endNum = parseFloat(endValue);
	          endUnit = endValue.substr((endNum + "").length);
	          index = _numWithUnitExp.lastIndex - endUnit.length;
	          if (!endUnit) {
	            //if something like "perspective:300" is passed in and we must add a unit to the end
	            endUnit = endUnit || _config.units[prop] || startUnit;
	            if (index === end.length) {
	              end += endUnit;
	              pt.e += endUnit;
	            }
	          }
	          if (startUnit !== endUnit) {
	            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
	          } // these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

	          pt._pt = {
	            _next: pt._pt,
	            p: chunk || matchIndex === 1 ? chunk : ",",
	            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
	            s: startNum,
	            c: endNum - startNum,
	            m: color && color < 4 || prop === "zIndex" ? Math.round : 0
	          };
	        }
	      }
	      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
	    } else {
	      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
	    }
	    _relExp.test(end) && (pt.e = 0); //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).

	    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

	    return pt;
	  },
	  _keywordToPercent = {
	    top: "0%",
	    bottom: "100%",
	    left: "0%",
	    right: "100%",
	    center: "50%"
	  },
	  _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
	    var split = value.split(" "),
	      x = split[0],
	      y = split[1] || "50%";
	    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
	      //the user provided them in the wrong order, so flip them
	      value = x;
	      x = y;
	      y = value;
	    }
	    split[0] = _keywordToPercent[x] || x;
	    split[1] = _keywordToPercent[y] || y;
	    return split.join(" ");
	  },
	  _renderClearProps = function _renderClearProps(ratio, data) {
	    if (data.tween && data.tween._time === data.tween._dur) {
	      var target = data.t,
	        style = target.style,
	        props = data.u,
	        cache = target._gsap,
	        prop,
	        clearTransforms,
	        i;
	      if (props === "all" || props === true) {
	        style.cssText = "";
	        clearTransforms = 1;
	      } else {
	        props = props.split(",");
	        i = props.length;
	        while (--i > -1) {
	          prop = props[i];
	          if (_transformProps[prop]) {
	            clearTransforms = 1;
	            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
	          }
	          _removeProperty(target, prop);
	        }
	      }
	      if (clearTransforms) {
	        _removeProperty(target, _transformProp);
	        if (cache) {
	          cache.svg && target.removeAttribute("transform");
	          _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.

	          cache.uncache = 1;
	          _removeIndependentTransforms(style);
	        }
	      }
	    }
	  },
	  // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
	  _specialProps = {
	    clearProps: function clearProps(plugin, target, property, endValue, tween) {
	      if (tween.data !== "isFromStart") {
	        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
	        pt.u = endValue;
	        pt.pr = -10;
	        pt.tween = tween;
	        plugin._props.push(property);
	        return 1;
	      }
	    }
	    /* className feature (about 0.4kb gzipped).
	    , className(plugin, target, property, endValue, tween) {
	    	let _renderClassName = (ratio, data) => {
	    			data.css.render(ratio, data.css);
	    			if (!ratio || ratio === 1) {
	    				let inline = data.rmv,
	    					target = data.t,
	    					p;
	    				target.setAttribute("class", ratio ? data.e : data.b);
	    				for (p in inline) {
	    					_removeProperty(target, p);
	    				}
	    			}
	    		},
	    		_getAllStyles = (target) => {
	    			let styles = {},
	    				computed = getComputedStyle(target),
	    				p;
	    			for (p in computed) {
	    				if (isNaN(p) && p !== "cssText" && p !== "length") {
	    					styles[p] = computed[p];
	    				}
	    			}
	    			_setDefaults(styles, _parseTransform(target, 1));
	    			return styles;
	    		},
	    		startClassList = target.getAttribute("class"),
	    		style = target.style,
	    		cssText = style.cssText,
	    		cache = target._gsap,
	    		classPT = cache.classPT,
	    		inlineToRemoveAtEnd = {},
	    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
	    		changingVars = {},
	    		startVars = _getAllStyles(target),
	    		transformRelated = /(transform|perspective)/i,
	    		endVars, p;
	    	if (classPT) {
	    		classPT.r(1, classPT.d);
	    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
	    	}
	    	target.setAttribute("class", data.e);
	    	endVars = _getAllStyles(target, true);
	    	target.setAttribute("class", startClassList);
	    	for (p in endVars) {
	    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
	    			changingVars[p] = endVars[p];
	    			if (!style[p] && style[p] !== "0") {
	    				inlineToRemoveAtEnd[p] = 1;
	    			}
	    		}
	    	}
	    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
	    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
	    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
	    	}
	    	_parseTransform(target, true); //to clear the caching of transforms
	    	data.css = new gsap.plugins.css();
	    	data.css.init(target, changingVars, tween);
	    	plugin._props.push(...data.css._props);
	    	return 1;
	    }
	    */
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * TRANSFORMS
	   * --------------------------------------------------------------------------------------
	   */
	  _identity2DMatrix = [1, 0, 0, 1, 0, 0],
	  _rotationalProperties = {},
	  _isNullTransform = function _isNullTransform(value) {
	    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
	  },
	  _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
	    var matrixString = _getComputedProperty(target, _transformProp);
	    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
	  },
	  _getMatrix = function _getMatrix(target, force2D) {
	    var cache = target._gsap || _getCache(target),
	      style = target.style,
	      matrix = _getComputedTransformMatrixAsArray(target),
	      parent,
	      nextSibling,
	      temp,
	      addedToDOM;
	    if (cache.svg && target.getAttribute("transform")) {
	      temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

	      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
	      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
	    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
	      //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
	      //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
	      temp = style.display;
	      style.display = "block";
	      parent = target.parentNode;
	      if (!parent || !target.offsetParent) {
	        // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
	        addedToDOM = 1; //flag

	        nextSibling = target.nextElementSibling;
	        _docElement.appendChild(target); //we must add it to the DOM in order to get values properly
	      }
	      matrix = _getComputedTransformMatrixAsArray(target);
	      temp ? style.display = temp : _removeProperty(target, "display");
	      if (addedToDOM) {
	        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
	      }
	    }
	    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
	  },
	  _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
	    var cache = target._gsap,
	      matrix = matrixArray || _getMatrix(target, true),
	      xOriginOld = cache.xOrigin || 0,
	      yOriginOld = cache.yOrigin || 0,
	      xOffsetOld = cache.xOffset || 0,
	      yOffsetOld = cache.yOffset || 0,
	      a = matrix[0],
	      b = matrix[1],
	      c = matrix[2],
	      d = matrix[3],
	      tx = matrix[4],
	      ty = matrix[5],
	      originSplit = origin.split(" "),
	      xOrigin = parseFloat(originSplit[0]) || 0,
	      yOrigin = parseFloat(originSplit[1]) || 0,
	      bounds,
	      determinant,
	      x,
	      y;
	    if (!originIsAbsolute) {
	      bounds = _getBBox(target);
	      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
	      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
	    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
	      //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
	      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
	      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
	      xOrigin = x;
	      yOrigin = y;
	    }
	    if (smooth || smooth !== false && cache.smooth) {
	      tx = xOrigin - xOriginOld;
	      ty = yOrigin - yOriginOld;
	      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
	      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
	    } else {
	      cache.xOffset = cache.yOffset = 0;
	    }
	    cache.xOrigin = xOrigin;
	    cache.yOrigin = yOrigin;
	    cache.smooth = !!smooth;
	    cache.origin = origin;
	    cache.originIsAbsolute = !!originIsAbsolute;
	    target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

	    if (pluginToAddPropTweensTo) {
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
	    }
	    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
	  },
	  _parseTransform = function _parseTransform(target, uncache) {
	    var cache = target._gsap || new GSCache(target);
	    if ("x" in cache && !uncache && !cache.uncache) {
	      return cache;
	    }
	    var style = target.style,
	      invertedScaleX = cache.scaleX < 0,
	      px = "px",
	      deg = "deg",
	      cs = getComputedStyle(target),
	      origin = _getComputedProperty(target, _transformOriginProp) || "0",
	      x,
	      y,
	      z,
	      scaleX,
	      scaleY,
	      rotation,
	      rotationX,
	      rotationY,
	      skewX,
	      skewY,
	      perspective,
	      xOrigin,
	      yOrigin,
	      matrix,
	      angle,
	      cos,
	      sin,
	      a,
	      b,
	      c,
	      d,
	      a12,
	      a22,
	      t1,
	      t2,
	      t3,
	      a13,
	      a23,
	      a33,
	      a42,
	      a43,
	      a32;
	    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
	    scaleX = scaleY = 1;
	    cache.svg = !!(target.getCTM && _isSVG(target));
	    if (cs.translate) {
	      // accommodate independent transforms by combining them into normal ones.
	      if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
	        style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
	      }
	      style.scale = style.rotate = style.translate = "none";
	    }
	    matrix = _getMatrix(target, cache.svg);
	    if (cache.svg) {
	      if (cache.uncache) {
	        // if cache.uncache is true (and maybe if origin is 0,0), we need to set element.style.transformOrigin = (cache.xOrigin - bbox.x) + "px " + (cache.yOrigin - bbox.y) + "px". Previously we let the data-svg-origin stay instead, but when introducing revert(), it complicated things.
	        t2 = target.getBBox();
	        origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
	        t1 = "";
	      } else {
	        t1 = !uncache && target.getAttribute("data-svg-origin"); //  Remember, to work around browser inconsistencies we always force SVG elements' transformOrigin to 0,0 and offset the translation accordingly.
	      }
	      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
	    }
	    xOrigin = cache.xOrigin || 0;
	    yOrigin = cache.yOrigin || 0;
	    if (matrix !== _identity2DMatrix) {
	      a = matrix[0]; //a11

	      b = matrix[1]; //a21

	      c = matrix[2]; //a31

	      d = matrix[3]; //a41

	      x = a12 = matrix[4];
	      y = a22 = matrix[5]; //2D matrix

	      if (matrix.length === 6) {
	        scaleX = Math.sqrt(a * a + b * b);
	        scaleY = Math.sqrt(d * d + c * c);
	        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

	        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
	        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
	        if (cache.svg) {
	          x -= xOrigin - (xOrigin * a + yOrigin * c);
	          y -= yOrigin - (xOrigin * b + yOrigin * d);
	        } //3D matrix
	      } else {
	        a32 = matrix[6];
	        a42 = matrix[7];
	        a13 = matrix[8];
	        a23 = matrix[9];
	        a33 = matrix[10];
	        a43 = matrix[11];
	        x = matrix[12];
	        y = matrix[13];
	        z = matrix[14];
	        angle = _atan2(a32, a33);
	        rotationX = angle * _RAD2DEG; //rotationX

	        if (angle) {
	          cos = Math.cos(-angle);
	          sin = Math.sin(-angle);
	          t1 = a12 * cos + a13 * sin;
	          t2 = a22 * cos + a23 * sin;
	          t3 = a32 * cos + a33 * sin;
	          a13 = a12 * -sin + a13 * cos;
	          a23 = a22 * -sin + a23 * cos;
	          a33 = a32 * -sin + a33 * cos;
	          a43 = a42 * -sin + a43 * cos;
	          a12 = t1;
	          a22 = t2;
	          a32 = t3;
	        } //rotationY

	        angle = _atan2(-c, a33);
	        rotationY = angle * _RAD2DEG;
	        if (angle) {
	          cos = Math.cos(-angle);
	          sin = Math.sin(-angle);
	          t1 = a * cos - a13 * sin;
	          t2 = b * cos - a23 * sin;
	          t3 = c * cos - a33 * sin;
	          a43 = d * sin + a43 * cos;
	          a = t1;
	          b = t2;
	          c = t3;
	        } //rotationZ

	        angle = _atan2(b, a);
	        rotation = angle * _RAD2DEG;
	        if (angle) {
	          cos = Math.cos(angle);
	          sin = Math.sin(angle);
	          t1 = a * cos + b * sin;
	          t2 = a12 * cos + a22 * sin;
	          b = b * cos - a * sin;
	          a22 = a22 * cos - a12 * sin;
	          a = t1;
	          a12 = t2;
	        }
	        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
	          //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
	          rotationX = rotation = 0;
	          rotationY = 180 - rotationY;
	        }
	        scaleX = _round(Math.sqrt(a * a + b * b + c * c));
	        scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
	        angle = _atan2(a12, a22);
	        skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
	        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
	      }
	      if (cache.svg) {
	        //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
	        t1 = target.getAttribute("transform");
	        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
	        t1 && target.setAttribute("transform", t1);
	      }
	    }
	    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
	      if (invertedScaleX) {
	        scaleX *= -1;
	        skewX += rotation <= 0 ? 180 : -180;
	        rotation += rotation <= 0 ? 180 : -180;
	      } else {
	        scaleY *= -1;
	        skewX += skewX <= 0 ? 180 : -180;
	      }
	    }
	    uncache = uncache || cache.uncache;
	    cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
	    cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
	    cache.z = z + px;
	    cache.scaleX = _round(scaleX);
	    cache.scaleY = _round(scaleY);
	    cache.rotation = _round(rotation) + deg;
	    cache.rotationX = _round(rotationX) + deg;
	    cache.rotationY = _round(rotationY) + deg;
	    cache.skewX = skewX + deg;
	    cache.skewY = skewY + deg;
	    cache.transformPerspective = perspective + px;
	    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
	      style[_transformOriginProp] = _firstTwoOnly(origin);
	    }
	    cache.xOffset = cache.yOffset = 0;
	    cache.force3D = _config.force3D;
	    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
	    cache.uncache = 0;
	    return cache;
	  },
	  _firstTwoOnly = function _firstTwoOnly(value) {
	    return (value = value.split(" "))[0] + " " + value[1];
	  },
	  //for handling transformOrigin values, stripping out the 3rd dimension
	  _addPxTranslate = function _addPxTranslate(target, start, value) {
	    var unit = getUnit(start);
	    return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
	  },
	  _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
	    cache.z = "0px";
	    cache.rotationY = cache.rotationX = "0deg";
	    cache.force3D = 0;
	    _renderCSSTransforms(ratio, cache);
	  },
	  _zeroDeg = "0deg",
	  _zeroPx = "0px",
	  _endParenthesis = ") ",
	  _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
	    var _ref = cache || this,
	      xPercent = _ref.xPercent,
	      yPercent = _ref.yPercent,
	      x = _ref.x,
	      y = _ref.y,
	      z = _ref.z,
	      rotation = _ref.rotation,
	      rotationY = _ref.rotationY,
	      rotationX = _ref.rotationX,
	      skewX = _ref.skewX,
	      skewY = _ref.skewY,
	      scaleX = _ref.scaleX,
	      scaleY = _ref.scaleY,
	      transformPerspective = _ref.transformPerspective,
	      force3D = _ref.force3D,
	      target = _ref.target,
	      zOrigin = _ref.zOrigin,
	      transforms = "",
	      use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)

	    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
	      var angle = parseFloat(rotationY) * _DEG2RAD,
	        a13 = Math.sin(angle),
	        a33 = Math.cos(angle),
	        cos;
	      angle = parseFloat(rotationX) * _DEG2RAD;
	      cos = Math.cos(angle);
	      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
	      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
	      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
	    }
	    if (transformPerspective !== _zeroPx) {
	      transforms += "perspective(" + transformPerspective + _endParenthesis;
	    }
	    if (xPercent || yPercent) {
	      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
	    }
	    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
	      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
	    }
	    if (rotation !== _zeroDeg) {
	      transforms += "rotate(" + rotation + _endParenthesis;
	    }
	    if (rotationY !== _zeroDeg) {
	      transforms += "rotateY(" + rotationY + _endParenthesis;
	    }
	    if (rotationX !== _zeroDeg) {
	      transforms += "rotateX(" + rotationX + _endParenthesis;
	    }
	    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
	      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
	    }
	    if (scaleX !== 1 || scaleY !== 1) {
	      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
	    }
	    target.style[_transformProp] = transforms || "translate(0, 0)";
	  },
	  _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
	    var _ref2 = cache || this,
	      xPercent = _ref2.xPercent,
	      yPercent = _ref2.yPercent,
	      x = _ref2.x,
	      y = _ref2.y,
	      rotation = _ref2.rotation,
	      skewX = _ref2.skewX,
	      skewY = _ref2.skewY,
	      scaleX = _ref2.scaleX,
	      scaleY = _ref2.scaleY,
	      target = _ref2.target,
	      xOrigin = _ref2.xOrigin,
	      yOrigin = _ref2.yOrigin,
	      xOffset = _ref2.xOffset,
	      yOffset = _ref2.yOffset,
	      forceCSS = _ref2.forceCSS,
	      tx = parseFloat(x),
	      ty = parseFloat(y),
	      a11,
	      a21,
	      a12,
	      a22,
	      temp;
	    rotation = parseFloat(rotation);
	    skewX = parseFloat(skewX);
	    skewY = parseFloat(skewY);
	    if (skewY) {
	      //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
	      skewY = parseFloat(skewY);
	      skewX += skewY;
	      rotation += skewY;
	    }
	    if (rotation || skewX) {
	      rotation *= _DEG2RAD;
	      skewX *= _DEG2RAD;
	      a11 = Math.cos(rotation) * scaleX;
	      a21 = Math.sin(rotation) * scaleX;
	      a12 = Math.sin(rotation - skewX) * -scaleY;
	      a22 = Math.cos(rotation - skewX) * scaleY;
	      if (skewX) {
	        skewY *= _DEG2RAD;
	        temp = Math.tan(skewX - skewY);
	        temp = Math.sqrt(1 + temp * temp);
	        a12 *= temp;
	        a22 *= temp;
	        if (skewY) {
	          temp = Math.tan(skewY);
	          temp = Math.sqrt(1 + temp * temp);
	          a11 *= temp;
	          a21 *= temp;
	        }
	      }
	      a11 = _round(a11);
	      a21 = _round(a21);
	      a12 = _round(a12);
	      a22 = _round(a22);
	    } else {
	      a11 = scaleX;
	      a22 = scaleY;
	      a21 = a12 = 0;
	    }
	    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
	      tx = _convertToUnit(target, "x", x, "px");
	      ty = _convertToUnit(target, "y", y, "px");
	    }
	    if (xOrigin || yOrigin || xOffset || yOffset) {
	      tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
	      ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
	    }
	    if (xPercent || yPercent) {
	      //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
	      temp = target.getBBox();
	      tx = _round(tx + xPercent / 100 * temp.width);
	      ty = _round(ty + yPercent / 100 * temp.height);
	    }
	    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
	    target.setAttribute("transform", temp);
	    forceCSS && (target.style[_transformProp] = temp); //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the transform attribute changes!)
	  },
	  _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue) {
	    var cap = 360,
	      isString = _isString(endValue),
	      endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
	      change = endNum - startNum,
	      finalValue = startNum + change + "deg",
	      direction,
	      pt;
	    if (isString) {
	      direction = endValue.split("_")[1];
	      if (direction === "short") {
	        change %= cap;
	        if (change !== change % (cap / 2)) {
	          change += change < 0 ? cap : -cap;
	        }
	      }
	      if (direction === "cw" && change < 0) {
	        change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
	      } else if (direction === "ccw" && change > 0) {
	        change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
	      }
	    }
	    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
	    pt.e = finalValue;
	    pt.u = "deg";
	    plugin._props.push(property);
	    return pt;
	  },
	  _assign = function _assign(target, source) {
	    // Internet Explorer doesn't have Object.assign(), so we recreate it here.
	    for (var p in source) {
	      target[p] = source[p];
	    }
	    return target;
	  },
	  _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
	    //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
	    var startCache = _assign({}, target._gsap),
	      exclude = "perspective,force3D,transformOrigin,svgOrigin",
	      style = target.style,
	      endCache,
	      p,
	      startValue,
	      endValue,
	      startNum,
	      endNum,
	      startUnit,
	      endUnit;
	    if (startCache.svg) {
	      startValue = target.getAttribute("transform");
	      target.setAttribute("transform", "");
	      style[_transformProp] = transforms;
	      endCache = _parseTransform(target, 1);
	      _removeProperty(target, _transformProp);
	      target.setAttribute("transform", startValue);
	    } else {
	      startValue = getComputedStyle(target)[_transformProp];
	      style[_transformProp] = transforms;
	      endCache = _parseTransform(target, 1);
	      style[_transformProp] = startValue;
	    }
	    for (p in _transformProps) {
	      startValue = startCache[p];
	      endValue = endCache[p];
	      if (startValue !== endValue && exclude.indexOf(p) < 0) {
	        //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
	        startUnit = getUnit(startValue);
	        endUnit = getUnit(endValue);
	        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
	        endNum = parseFloat(endValue);
	        plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
	        plugin._pt.u = endUnit || 0;
	        plugin._props.push(p);
	      }
	    }
	    _assign(endCache, startCache);
	  }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.

	_forEachName("padding,margin,Width,Radius", function (name, index) {
	  var t = "Top",
	    r = "Right",
	    b = "Bottom",
	    l = "Left",
	    props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
	      return index < 2 ? name + side : "border" + side + name;
	    });
	  _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
	    var a, vars;
	    if (arguments.length < 4) {
	      // getter, passed target, property, and unit (from _get())
	      a = props.map(function (prop) {
	        return _get(plugin, prop, property);
	      });
	      vars = a.join(" ");
	      return vars.split(a[0]).length === 5 ? a[0] : vars;
	    }
	    a = (endValue + "").split(" ");
	    vars = {};
	    props.forEach(function (prop, i) {
	      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
	    });
	    plugin.init(target, vars, tween);
	  };
	});
	var CSSPlugin = {
	  name: "css",
	  register: _initCore,
	  targetTest: function targetTest(target) {
	    return target.style && target.nodeType;
	  },
	  init: function init(target, vars, tween, index, targets) {
	    var props = this._props,
	      style = target.style,
	      startAt = tween.vars.startAt,
	      startValue,
	      endValue,
	      endNum,
	      startNum,
	      type,
	      specialProp,
	      p,
	      startUnit,
	      endUnit,
	      relative,
	      isTransformRelated,
	      transformPropTween,
	      cache,
	      smooth,
	      hasPriority,
	      inlineProps;
	    _pluginInitted || _initCore(); // we may call init() multiple times on the same plugin instance, like when adding special properties, so make sure we don't overwrite the revert data or inlineProps

	    this.styles = this.styles || _getStyleSaver(target);
	    inlineProps = this.styles.props;
	    this.tween = tween;
	    for (p in vars) {
	      if (p === "autoRound") {
	        continue;
	      }
	      endValue = vars[p];
	      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
	        // plugins
	        continue;
	      }
	      type = typeof endValue;
	      specialProp = _specialProps[p];
	      if (type === "function") {
	        endValue = endValue.call(tween, index, target, targets);
	        type = typeof endValue;
	      }
	      if (type === "string" && ~endValue.indexOf("random(")) {
	        endValue = _replaceRandom(endValue);
	      }
	      if (specialProp) {
	        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
	      } else if (p.substr(0, 2) === "--") {
	        //CSS variable
	        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
	        endValue += "";
	        _colorExp.lastIndex = 0;
	        if (!_colorExp.test(startValue)) {
	          // colors don't have units
	          startUnit = getUnit(startValue);
	          endUnit = getUnit(endValue);
	        }
	        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
	        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
	        props.push(p);
	        inlineProps.push(p, 0, style[p]);
	      } else if (type !== "undefined") {
	        if (startAt && p in startAt) {
	          // in case someone hard-codes a complex value as the start, like top: "calc(2vh / 2)". Without this, it'd use the computed value (always in px)
	          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
	          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
	          getUnit(startValue + "") || (startValue += _config.units[p] || getUnit(_get(target, p)) || ""); // for cases when someone passes in a unitless value like {x: 100}; if we try setting translate(100, 0px) it won't work.

	          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p)); // can't work with relative values
	        } else {
	          startValue = _get(target, p);
	        }
	        startNum = parseFloat(startValue);
	        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
	        relative && (endValue = endValue.substr(2));
	        endNum = parseFloat(endValue);
	        if (p in _propertyAliases) {
	          if (p === "autoAlpha") {
	            //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
	            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
	              //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
	              startNum = 0;
	            }
	            inlineProps.push("visibility", 0, style.visibility);
	            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
	          }
	          if (p !== "scale" && p !== "transform") {
	            p = _propertyAliases[p];
	            ~p.indexOf(",") && (p = p.split(",")[0]);
	          }
	        }
	        isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

	        if (isTransformRelated) {
	          this.styles.save(p);
	          if (!transformPropTween) {
	            cache = target._gsap;
	            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

	            smooth = vars.smoothOrigin !== false && cache.smooth;
	            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

	            transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
	          }
	          if (p === "scale") {
	            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
	            this._pt.u = 0;
	            props.push("scaleY", p);
	            p += "X";
	          } else if (p === "transformOrigin") {
	            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
	            endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

	            if (cache.svg) {
	              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
	            } else {
	              endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

	              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
	              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
	            }
	            continue;
	          } else if (p === "svgOrigin") {
	            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
	            continue;
	          } else if (p in _rotationalProperties) {
	            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
	            continue;
	          } else if (p === "smoothOrigin") {
	            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
	            continue;
	          } else if (p === "force3D") {
	            cache[p] = endValue;
	            continue;
	          } else if (p === "transform") {
	            _addRawTransformPTs(this, endValue, target);
	            continue;
	          }
	        } else if (!(p in style)) {
	          p = _checkPropPrefix(p) || p;
	        }
	        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
	          startUnit = (startValue + "").substr((startNum + "").length);
	          endNum || (endNum = 0); // protect against NaN

	          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
	          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
	          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
	          this._pt.u = endUnit || 0;
	          if (startUnit !== endUnit && endUnit !== "%") {
	            //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
	            this._pt.b = startValue;
	            this._pt.r = _renderCSSPropWithBeginning;
	          }
	        } else if (!(p in style)) {
	          if (p in target) {
	            //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
	            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
	          } else if (p !== "parseTransform") {
	            _missingPlugin(p, endValue);
	            continue;
	          }
	        } else {
	          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
	        }
	        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : inlineProps.push(p, 1, startValue || target[p]));
	        props.push(p);
	      }
	    }
	    hasPriority && _sortPropTweensByPriority(this);
	  },
	  render: function render(ratio, data) {
	    if (data.tween._time || !_reverting()) {
	      var pt = data._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	    } else {
	      data.styles.revert();
	    }
	  },
	  get: _get,
	  aliases: _propertyAliases,
	  getSetter: function getSetter(target, property, plugin) {
	    //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
	    var p = _propertyAliases[property];
	    p && p.indexOf(",") < 0 && (property = p);
	    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
	  },
	  core: {
	    _removeProperty: _removeProperty,
	    _getMatrix: _getMatrix
	  }
	};
	gsap.utils.checkPrefix = _checkPropPrefix;
	gsap.core.getStyleSaver = _getStyleSaver;
	(function (positionAndScale, rotation, others, aliases) {
	  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
	    _transformProps[name] = 1;
	  });
	  _forEachName(rotation, function (name) {
	    _config.units[name] = "deg";
	    _rotationalProperties[name] = 1;
	  });
	  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
	  _forEachName(aliases, function (name) {
	    var split = name.split(":");
	    _propertyAliases[split[1]] = all[split[0]];
	  });
	})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
	_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
	  _config.units[name] = "px";
	});
	gsap.registerPlugin(CSSPlugin);

	var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
	  // to protect from tree shaking
	  gsapWithCSS.core.Tween;

	const bodyLocker = bool => {
	  const body = document.querySelector("body");
	  if (bool) {
	    body.style.overflow = "hidden";
	  } else {
	    body.style.overflow = "auto";
	  }
	};

	const loader = document.querySelector('.loader');
	document.querySelector('.nav');
	document.querySelector('.nav-opener');
	document.querySelector('.nav-closer');

	if (loader) {
	  bodyLocker(true);
	  imagesLoaded('body', {
	    background: true
	  }, () => {
	    gsapWithCSS.fromTo('.loader', {
	      opacity: 1
	    }, {
	      opacity: 0,
	      display: 'none',
	      duration: 1,
	      delay: 0.5,
	      ease: 'ease-in',
	      onComplete: () => {
	        bodyLocker(false);
	      }
	    });
	  });
	}

	/** Checks if value is string */
	function isString(str) {
	  return typeof str === 'string' || str instanceof String;
	}

	/** Checks if value is object */
	function isObject(obj) {
	  var _obj$constructor;
	  return typeof obj === 'object' && obj != null && (obj == null || (_obj$constructor = obj.constructor) == null ? void 0 : _obj$constructor.name) === 'Object';
	}
	function pick(obj, keys) {
	  if (Array.isArray(keys)) return pick(obj, (_, k) => keys.includes(k));
	  return Object.entries(obj).reduce((acc, _ref) => {
	    let [k, v] = _ref;
	    if (keys(v, k)) acc[k] = v;
	    return acc;
	  }, {});
	}

	/** Direction */
	const DIRECTION = {
	  NONE: 'NONE',
	  LEFT: 'LEFT',
	  FORCE_LEFT: 'FORCE_LEFT',
	  RIGHT: 'RIGHT',
	  FORCE_RIGHT: 'FORCE_RIGHT'
	};

	/** Direction */

	function forceDirection(direction) {
	  switch (direction) {
	    case DIRECTION.LEFT:
	      return DIRECTION.FORCE_LEFT;
	    case DIRECTION.RIGHT:
	      return DIRECTION.FORCE_RIGHT;
	    default:
	      return direction;
	  }
	}

	/** Escapes regular expression control chars */
	function escapeRegExp(str) {
	  return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
	}

	// cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
	function objectIncludes(b, a) {
	  if (a === b) return true;
	  const arrA = Array.isArray(a),
	    arrB = Array.isArray(b);
	  let i;
	  if (arrA && arrB) {
	    if (a.length != b.length) return false;
	    for (i = 0; i < a.length; i++) if (!objectIncludes(a[i], b[i])) return false;
	    return true;
	  }
	  if (arrA != arrB) return false;
	  if (a && b && typeof a === 'object' && typeof b === 'object') {
	    const dateA = a instanceof Date,
	      dateB = b instanceof Date;
	    if (dateA && dateB) return a.getTime() == b.getTime();
	    if (dateA != dateB) return false;
	    const regexpA = a instanceof RegExp,
	      regexpB = b instanceof RegExp;
	    if (regexpA && regexpB) return a.toString() == b.toString();
	    if (regexpA != regexpB) return false;
	    const keys = Object.keys(a);
	    // if (keys.length !== Object.keys(b).length) return false;

	    for (i = 0; i < keys.length; i++) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
	    for (i = 0; i < keys.length; i++) if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
	    return true;
	  } else if (a && b && typeof a === 'function' && typeof b === 'function') {
	    return a.toString() === b.toString();
	  }
	  return false;
	}

	/** Provides details of changing input */
	class ActionDetails {
	  /** Current input value */

	  /** Current cursor position */

	  /** Old input value */

	  /** Old selection */

	  constructor(opts) {
	    Object.assign(this, opts);

	    // double check if left part was changed (autofilling, other non-standard input triggers)
	    while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
	      --this.oldSelection.start;
	    }
	    if (this.insertedCount) {
	      // double check right part
	      while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) {
	        if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end;else ++this.cursorPos;
	      }
	    }
	  }

	  /** Start changing position */
	  get startChangePos() {
	    return Math.min(this.cursorPos, this.oldSelection.start);
	  }

	  /** Inserted symbols count */
	  get insertedCount() {
	    return this.cursorPos - this.startChangePos;
	  }

	  /** Inserted symbols */
	  get inserted() {
	    return this.value.substr(this.startChangePos, this.insertedCount);
	  }

	  /** Removed symbols count */
	  get removedCount() {
	    // Math.max for opposite operation
	    return Math.max(this.oldSelection.end - this.startChangePos ||
	    // for Delete
	    this.oldValue.length - this.value.length, 0);
	  }

	  /** Removed symbols */
	  get removed() {
	    return this.oldValue.substr(this.startChangePos, this.removedCount);
	  }

	  /** Unchanged head symbols */
	  get head() {
	    return this.value.substring(0, this.startChangePos);
	  }

	  /** Unchanged tail symbols */
	  get tail() {
	    return this.value.substring(this.startChangePos + this.insertedCount);
	  }

	  /** Remove direction */
	  get removeDirection() {
	    if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

	    // align right if delete at right
	    return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) &&
	    // if not range removed (event with backspace)
	    this.oldSelection.end === this.oldSelection.start ? DIRECTION.RIGHT : DIRECTION.LEFT;
	  }
	}

	/** Applies mask on element */
	function IMask(el, opts) {
	  // currently available only for input-like elements
	  return new IMask.InputMask(el, opts);
	}

	// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
	// export function maskedClass(mask: string): typeof MaskedPattern;
	// export function maskedClass(mask: DateConstructor): typeof MaskedDate;
	// export function maskedClass(mask: NumberConstructor): typeof MaskedNumber;
	// export function maskedClass(mask: Array<any> | ArrayConstructor): typeof MaskedDynamic;
	// export function maskedClass(mask: MaskedDate): typeof MaskedDate;
	// export function maskedClass(mask: MaskedNumber): typeof MaskedNumber;
	// export function maskedClass(mask: MaskedEnum): typeof MaskedEnum;
	// export function maskedClass(mask: MaskedRange): typeof MaskedRange;
	// export function maskedClass(mask: MaskedRegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: MaskedFunction): typeof MaskedFunction;
	// export function maskedClass(mask: MaskedPattern): typeof MaskedPattern;
	// export function maskedClass(mask: MaskedDynamic): typeof MaskedDynamic;
	// export function maskedClass(mask: Masked): typeof Masked;
	// export function maskedClass(mask: typeof Masked): typeof Masked;
	// export function maskedClass(mask: typeof MaskedDate): typeof MaskedDate;
	// export function maskedClass(mask: typeof MaskedNumber): typeof MaskedNumber;
	// export function maskedClass(mask: typeof MaskedEnum): typeof MaskedEnum;
	// export function maskedClass(mask: typeof MaskedRange): typeof MaskedRange;
	// export function maskedClass(mask: typeof MaskedRegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: typeof MaskedFunction): typeof MaskedFunction;
	// export function maskedClass(mask: typeof MaskedPattern): typeof MaskedPattern;
	// export function maskedClass(mask: typeof MaskedDynamic): typeof MaskedDynamic;
	// export function maskedClass<Mask extends typeof Masked> (mask: Mask): Mask;
	// export function maskedClass(mask: RegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: (value: string, ...args: any[]) => boolean): typeof MaskedFunction;

	/** Get Masked class by mask type */
	function maskedClass(mask) /* TODO */{
	  if (mask == null) throw new Error('mask property should be defined');
	  if (mask instanceof RegExp) return IMask.MaskedRegExp;
	  if (isString(mask)) return IMask.MaskedPattern;
	  if (mask === Date) return IMask.MaskedDate;
	  if (mask === Number) return IMask.MaskedNumber;
	  if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
	  if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask;
	  if (IMask.Masked && mask instanceof IMask.Masked) return mask.constructor;
	  if (mask instanceof Function) return IMask.MaskedFunction;
	  console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
	  return IMask.Masked;
	}
	function normalizeOpts(opts) {
	  if (!opts) throw new Error('Options in not defined');
	  if (IMask.Masked) {
	    if (opts.prototype instanceof IMask.Masked) return {
	      mask: opts
	    };

	    /*
	      handle cases like:
	      1) opts = Masked
	      2) opts = { mask: Masked, ...instanceOpts }
	    */
	    const {
	      mask = undefined,
	      ...instanceOpts
	    } = opts instanceof IMask.Masked ? {
	      mask: opts
	    } : isObject(opts) && opts.mask instanceof IMask.Masked ? opts : {};
	    if (mask) {
	      const _mask = mask.mask;
	      return {
	        ...pick(mask, (_, k) => !k.startsWith('_')),
	        mask: mask.constructor,
	        _mask,
	        ...instanceOpts
	      };
	    }
	  }
	  if (!isObject(opts)) return {
	    mask: opts
	  };
	  return {
	    ...opts
	  };
	}

	// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754

	// From masked
	// export default function createMask<Opts extends Masked, ReturnMasked=Opts> (opts: Opts): ReturnMasked;
	// // From masked class
	// export default function createMask<Opts extends MaskedOptions<typeof Masked>, ReturnMasked extends Masked=InstanceType<Opts['mask']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedDate>, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedNumber>, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedEnum>, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedRange>, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedRegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedFunction>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedPattern>, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedDynamic>, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
	// // From mask opts
	// export default function createMask<Opts extends MaskedOptions<Masked>, ReturnMasked=Opts extends MaskedOptions<infer M> ? M : never> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedNumberOptions, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedDateFactoryOptions, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedEnumOptions, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedRangeOptions, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedPatternOptions, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedDynamicOptions, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<RegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<Function>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;

	/** Creates new {@link Masked} depending on mask type */
	function createMask(opts) {
	  if (IMask.Masked && opts instanceof IMask.Masked) return opts;
	  const nOpts = normalizeOpts(opts);
	  const MaskedClass = maskedClass(nOpts.mask);
	  if (!MaskedClass) throw new Error("Masked class is not found for provided mask " + nOpts.mask + ", appropriate module needs to be imported manually before creating mask.");
	  if (nOpts.mask === MaskedClass) delete nOpts.mask;
	  if (nOpts._mask) {
	    nOpts.mask = nOpts._mask;
	    delete nOpts._mask;
	  }
	  return new MaskedClass(nOpts);
	}
	IMask.createMask = createMask;

	/**  Generic element API to use with mask */
	class MaskElement {
	  /** */

	  /** */

	  /** */

	  /** Safely returns selection start */
	  get selectionStart() {
	    let start;
	    try {
	      start = this._unsafeSelectionStart;
	    } catch {}
	    return start != null ? start : this.value.length;
	  }

	  /** Safely returns selection end */
	  get selectionEnd() {
	    let end;
	    try {
	      end = this._unsafeSelectionEnd;
	    } catch {}
	    return end != null ? end : this.value.length;
	  }

	  /** Safely sets element selection */
	  select(start, end) {
	    if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;
	    try {
	      this._unsafeSelect(start, end);
	    } catch {}
	  }

	  /** */
	  get isActive() {
	    return false;
	  }
	  /** */

	  /** */

	  /** */
	}
	IMask.MaskElement = MaskElement;

	const KEY_Z = 90;
	const KEY_Y = 89;

	/** Bridge between HTMLElement and {@link Masked} */
	class HTMLMaskElement extends MaskElement {
	  /** HTMLElement to use mask on */

	  constructor(input) {
	    super();
	    this.input = input;
	    this._onKeydown = this._onKeydown.bind(this);
	    this._onInput = this._onInput.bind(this);
	    this._onBeforeinput = this._onBeforeinput.bind(this);
	    this._onCompositionEnd = this._onCompositionEnd.bind(this);
	  }
	  get rootElement() {
	    var _this$input$getRootNo, _this$input$getRootNo2, _this$input;
	    return (_this$input$getRootNo = (_this$input$getRootNo2 = (_this$input = this.input).getRootNode) == null ? void 0 : _this$input$getRootNo2.call(_this$input)) != null ? _this$input$getRootNo : document;
	  }

	  /** Is element in focus */
	  get isActive() {
	    return this.input === this.rootElement.activeElement;
	  }

	  /** Binds HTMLElement events to mask internal events */
	  bindEvents(handlers) {
	    this.input.addEventListener('keydown', this._onKeydown);
	    this.input.addEventListener('input', this._onInput);
	    this.input.addEventListener('beforeinput', this._onBeforeinput);
	    this.input.addEventListener('compositionend', this._onCompositionEnd);
	    this.input.addEventListener('drop', handlers.drop);
	    this.input.addEventListener('click', handlers.click);
	    this.input.addEventListener('focus', handlers.focus);
	    this.input.addEventListener('blur', handlers.commit);
	    this._handlers = handlers;
	  }
	  _onKeydown(e) {
	    if (this._handlers.redo && (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey) || e.keyCode === KEY_Y && e.ctrlKey)) {
	      e.preventDefault();
	      return this._handlers.redo(e);
	    }
	    if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
	      e.preventDefault();
	      return this._handlers.undo(e);
	    }
	    if (!e.isComposing) this._handlers.selectionChange(e);
	  }
	  _onBeforeinput(e) {
	    if (e.inputType === 'historyUndo' && this._handlers.undo) {
	      e.preventDefault();
	      return this._handlers.undo(e);
	    }
	    if (e.inputType === 'historyRedo' && this._handlers.redo) {
	      e.preventDefault();
	      return this._handlers.redo(e);
	    }
	  }
	  _onCompositionEnd(e) {
	    this._handlers.input(e);
	  }
	  _onInput(e) {
	    if (!e.isComposing) this._handlers.input(e);
	  }

	  /** Unbinds HTMLElement events to mask internal events */
	  unbindEvents() {
	    this.input.removeEventListener('keydown', this._onKeydown);
	    this.input.removeEventListener('input', this._onInput);
	    this.input.removeEventListener('beforeinput', this._onBeforeinput);
	    this.input.removeEventListener('compositionend', this._onCompositionEnd);
	    this.input.removeEventListener('drop', this._handlers.drop);
	    this.input.removeEventListener('click', this._handlers.click);
	    this.input.removeEventListener('focus', this._handlers.focus);
	    this.input.removeEventListener('blur', this._handlers.commit);
	    this._handlers = {};
	  }
	}
	IMask.HTMLMaskElement = HTMLMaskElement;

	/** Bridge between InputElement and {@link Masked} */
	class HTMLInputMaskElement extends HTMLMaskElement {
	  /** InputElement to use mask on */

	  constructor(input) {
	    super(input);
	    this.input = input;
	  }

	  /** Returns InputElement selection start */
	  get _unsafeSelectionStart() {
	    return this.input.selectionStart != null ? this.input.selectionStart : this.value.length;
	  }

	  /** Returns InputElement selection end */
	  get _unsafeSelectionEnd() {
	    return this.input.selectionEnd;
	  }

	  /** Sets InputElement selection */
	  _unsafeSelect(start, end) {
	    this.input.setSelectionRange(start, end);
	  }
	  get value() {
	    return this.input.value;
	  }
	  set value(value) {
	    this.input.value = value;
	  }
	}
	IMask.HTMLMaskElement = HTMLMaskElement;

	class HTMLContenteditableMaskElement extends HTMLMaskElement {
	  /** Returns HTMLElement selection start */
	  get _unsafeSelectionStart() {
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    const anchorOffset = selection && selection.anchorOffset;
	    const focusOffset = selection && selection.focusOffset;
	    if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) {
	      return anchorOffset;
	    }
	    return focusOffset;
	  }

	  /** Returns HTMLElement selection end */
	  get _unsafeSelectionEnd() {
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    const anchorOffset = selection && selection.anchorOffset;
	    const focusOffset = selection && selection.focusOffset;
	    if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) {
	      return anchorOffset;
	    }
	    return focusOffset;
	  }

	  /** Sets HTMLElement selection */
	  _unsafeSelect(start, end) {
	    if (!this.rootElement.createRange) return;
	    const range = this.rootElement.createRange();
	    range.setStart(this.input.firstChild || this.input, start);
	    range.setEnd(this.input.lastChild || this.input, end);
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    if (selection) {
	      selection.removeAllRanges();
	      selection.addRange(range);
	    }
	  }

	  /** HTMLElement value */
	  get value() {
	    return this.input.textContent || '';
	  }
	  set value(value) {
	    this.input.textContent = value;
	  }
	}
	IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;

	class InputHistory {
	  constructor() {
	    this.states = [];
	    this.currentIndex = 0;
	  }
	  get currentState() {
	    return this.states[this.currentIndex];
	  }
	  get isEmpty() {
	    return this.states.length === 0;
	  }
	  push(state) {
	    // if current index points before the last element then remove the future
	    if (this.currentIndex < this.states.length - 1) this.states.length = this.currentIndex + 1;
	    this.states.push(state);
	    if (this.states.length > InputHistory.MAX_LENGTH) this.states.shift();
	    this.currentIndex = this.states.length - 1;
	  }
	  go(steps) {
	    this.currentIndex = Math.min(Math.max(this.currentIndex + steps, 0), this.states.length - 1);
	    return this.currentState;
	  }
	  undo() {
	    return this.go(-1);
	  }
	  redo() {
	    return this.go(+1);
	  }
	  clear() {
	    this.states.length = 0;
	    this.currentIndex = 0;
	  }
	}
	InputHistory.MAX_LENGTH = 100;

	/** Listens to element events and controls changes between element and {@link Masked} */
	class InputMask {
	  /**
	    View element
	  */

	  /** Internal {@link Masked} model */

	  constructor(el, opts) {
	    this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLInputMaskElement(el);
	    this.masked = createMask(opts);
	    this._listeners = {};
	    this._value = '';
	    this._unmaskedValue = '';
	    this._rawInputValue = '';
	    this.history = new InputHistory();
	    this._saveSelection = this._saveSelection.bind(this);
	    this._onInput = this._onInput.bind(this);
	    this._onChange = this._onChange.bind(this);
	    this._onDrop = this._onDrop.bind(this);
	    this._onFocus = this._onFocus.bind(this);
	    this._onClick = this._onClick.bind(this);
	    this._onUndo = this._onUndo.bind(this);
	    this._onRedo = this._onRedo.bind(this);
	    this.alignCursor = this.alignCursor.bind(this);
	    this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
	    this._bindEvents();

	    // refresh
	    this.updateValue();
	    this._onChange();
	  }
	  maskEquals(mask) {
	    var _this$masked;
	    return mask == null || ((_this$masked = this.masked) == null ? void 0 : _this$masked.maskEquals(mask));
	  }

	  /** Masked */
	  get mask() {
	    return this.masked.mask;
	  }
	  set mask(mask) {
	    if (this.maskEquals(mask)) return;
	    if (!(mask instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
	      // TODO "any" no idea
	      this.masked.updateOptions({
	        mask
	      });
	      return;
	    }
	    const masked = mask instanceof IMask.Masked ? mask : createMask({
	      mask
	    });
	    masked.unmaskedValue = this.masked.unmaskedValue;
	    this.masked = masked;
	  }

	  /** Raw value */
	  get value() {
	    return this._value;
	  }
	  set value(str) {
	    if (this.value === str) return;
	    this.masked.value = str;
	    this.updateControl('auto');
	  }

	  /** Unmasked value */
	  get unmaskedValue() {
	    return this._unmaskedValue;
	  }
	  set unmaskedValue(str) {
	    if (this.unmaskedValue === str) return;
	    this.masked.unmaskedValue = str;
	    this.updateControl('auto');
	  }

	  /** Raw input value */
	  get rawInputValue() {
	    return this._rawInputValue;
	  }
	  set rawInputValue(str) {
	    if (this.rawInputValue === str) return;
	    this.masked.rawInputValue = str;
	    this.updateControl();
	    this.alignCursor();
	  }

	  /** Typed unmasked value */
	  get typedValue() {
	    return this.masked.typedValue;
	  }
	  set typedValue(val) {
	    if (this.masked.typedValueEquals(val)) return;
	    this.masked.typedValue = val;
	    this.updateControl('auto');
	  }

	  /** Display value */
	  get displayValue() {
	    return this.masked.displayValue;
	  }

	  /** Starts listening to element events */
	  _bindEvents() {
	    this.el.bindEvents({
	      selectionChange: this._saveSelection,
	      input: this._onInput,
	      drop: this._onDrop,
	      click: this._onClick,
	      focus: this._onFocus,
	      commit: this._onChange,
	      undo: this._onUndo,
	      redo: this._onRedo
	    });
	  }

	  /** Stops listening to element events */
	  _unbindEvents() {
	    if (this.el) this.el.unbindEvents();
	  }

	  /** Fires custom event */
	  _fireEvent(ev, e) {
	    const listeners = this._listeners[ev];
	    if (!listeners) return;
	    listeners.forEach(l => l(e));
	  }

	  /** Current selection start */
	  get selectionStart() {
	    return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
	  }

	  /** Current cursor position */
	  get cursorPos() {
	    return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
	  }
	  set cursorPos(pos) {
	    if (!this.el || !this.el.isActive) return;
	    this.el.select(pos, pos);
	    this._saveSelection();
	  }

	  /** Stores current selection */
	  _saveSelection( /* ev */
	  ) {
	    if (this.displayValue !== this.el.value) {
	      console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
	    }
	    this._selection = {
	      start: this.selectionStart,
	      end: this.cursorPos
	    };
	  }

	  /** Syncronizes model value from view */
	  updateValue() {
	    this.masked.value = this.el.value;
	    this._value = this.masked.value;
	    this._unmaskedValue = this.masked.unmaskedValue;
	    this._rawInputValue = this.masked.rawInputValue;
	  }

	  /** Syncronizes view from model value, fires change events */
	  updateControl(cursorPos) {
	    const newUnmaskedValue = this.masked.unmaskedValue;
	    const newValue = this.masked.value;
	    const newRawInputValue = this.masked.rawInputValue;
	    const newDisplayValue = this.displayValue;
	    const isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue || this._rawInputValue !== newRawInputValue;
	    this._unmaskedValue = newUnmaskedValue;
	    this._value = newValue;
	    this._rawInputValue = newRawInputValue;
	    if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
	    if (cursorPos === 'auto') this.alignCursor();else if (cursorPos != null) this.cursorPos = cursorPos;
	    if (isChanged) this._fireChangeEvents();
	    if (!this._historyChanging && (isChanged || this.history.isEmpty)) this.history.push({
	      unmaskedValue: newUnmaskedValue,
	      selection: {
	        start: this.selectionStart,
	        end: this.cursorPos
	      }
	    });
	  }

	  /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
	  updateOptions(opts) {
	    const {
	      mask,
	      ...restOpts
	    } = opts; // TODO types, yes, mask is optional

	    const updateMask = !this.maskEquals(mask);
	    const updateOpts = this.masked.optionsIsChanged(restOpts);
	    if (updateMask) this.mask = mask;
	    if (updateOpts) this.masked.updateOptions(restOpts); // TODO

	    if (updateMask || updateOpts) this.updateControl();
	  }

	  /** Updates cursor */
	  updateCursor(cursorPos) {
	    if (cursorPos == null) return;
	    this.cursorPos = cursorPos;

	    // also queue change cursor for mobile browsers
	    this._delayUpdateCursor(cursorPos);
	  }

	  /** Delays cursor update to support mobile browsers */
	  _delayUpdateCursor(cursorPos) {
	    this._abortUpdateCursor();
	    this._changingCursorPos = cursorPos;
	    this._cursorChanging = setTimeout(() => {
	      if (!this.el) return; // if was destroyed
	      this.cursorPos = this._changingCursorPos;
	      this._abortUpdateCursor();
	    }, 10);
	  }

	  /** Fires custom events */
	  _fireChangeEvents() {
	    this._fireEvent('accept', this._inputEvent);
	    if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
	  }

	  /** Aborts delayed cursor update */
	  _abortUpdateCursor() {
	    if (this._cursorChanging) {
	      clearTimeout(this._cursorChanging);
	      delete this._cursorChanging;
	    }
	  }

	  /** Aligns cursor to nearest available position */
	  alignCursor() {
	    this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
	  }

	  /** Aligns cursor only if selection is empty */
	  alignCursorFriendly() {
	    if (this.selectionStart !== this.cursorPos) return; // skip if range is selected
	    this.alignCursor();
	  }

	  /** Adds listener on custom event */
	  on(ev, handler) {
	    if (!this._listeners[ev]) this._listeners[ev] = [];
	    this._listeners[ev].push(handler);
	    return this;
	  }

	  /** Removes custom event listener */
	  off(ev, handler) {
	    if (!this._listeners[ev]) return this;
	    if (!handler) {
	      delete this._listeners[ev];
	      return this;
	    }
	    const hIndex = this._listeners[ev].indexOf(handler);
	    if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
	    return this;
	  }

	  /** Handles view input event */
	  _onInput(e) {
	    this._inputEvent = e;
	    this._abortUpdateCursor();
	    const details = new ActionDetails({
	      // new state
	      value: this.el.value,
	      cursorPos: this.cursorPos,
	      // old state
	      oldValue: this.displayValue,
	      oldSelection: this._selection
	    });
	    const oldRawValue = this.masked.rawInputValue;
	    const offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection, {
	      input: true,
	      raw: true
	    }).offset;

	    // force align in remove direction only if no input chars were removed
	    // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
	    const removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
	    let cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
	    if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);
	    this.updateControl(cursorPos);
	    delete this._inputEvent;
	  }

	  /** Handles view change event and commits model value */
	  _onChange() {
	    if (this.displayValue !== this.el.value) this.updateValue();
	    this.masked.doCommit();
	    this.updateControl();
	    this._saveSelection();
	  }

	  /** Handles view drop event, prevents by default */
	  _onDrop(ev) {
	    ev.preventDefault();
	    ev.stopPropagation();
	  }

	  /** Restore last selection on focus */
	  _onFocus(ev) {
	    this.alignCursorFriendly();
	  }

	  /** Restore last selection on focus */
	  _onClick(ev) {
	    this.alignCursorFriendly();
	  }
	  _onUndo() {
	    this._applyHistoryState(this.history.undo());
	  }
	  _onRedo() {
	    this._applyHistoryState(this.history.redo());
	  }
	  _applyHistoryState(state) {
	    if (!state) return;
	    this._historyChanging = true;
	    this.unmaskedValue = state.unmaskedValue;
	    this.el.select(state.selection.start, state.selection.end);
	    this._saveSelection();
	    this._historyChanging = false;
	  }

	  /** Unbind view events and removes element reference */
	  destroy() {
	    this._unbindEvents();
	    this._listeners.length = 0;
	    delete this.el;
	  }
	}
	IMask.InputMask = InputMask;

	/** Provides details of changing model value */
	class ChangeDetails {
	  /** Inserted symbols */

	  /** Additional offset if any changes occurred before tail */

	  /** Raw inserted is used by dynamic mask */

	  /** Can skip chars */

	  static normalize(prep) {
	    return Array.isArray(prep) ? prep : [prep, new ChangeDetails()];
	  }
	  constructor(details) {
	    Object.assign(this, {
	      inserted: '',
	      rawInserted: '',
	      tailShift: 0,
	      skip: false
	    }, details);
	  }

	  /** Aggregate changes */
	  aggregate(details) {
	    this.inserted += details.inserted;
	    this.rawInserted += details.rawInserted;
	    this.tailShift += details.tailShift;
	    this.skip = this.skip || details.skip;
	    return this;
	  }

	  /** Total offset considering all changes */
	  get offset() {
	    return this.tailShift + this.inserted.length;
	  }
	  get consumed() {
	    return Boolean(this.rawInserted) || this.skip;
	  }
	  equals(details) {
	    return this.inserted === details.inserted && this.tailShift === details.tailShift && this.rawInserted === details.rawInserted && this.skip === details.skip;
	  }
	}
	IMask.ChangeDetails = ChangeDetails;

	/** Provides details of continuous extracted tail */
	class ContinuousTailDetails {
	  /** Tail value as string */

	  /** Tail start position */

	  /** Start position */

	  constructor(value, from, stop) {
	    if (value === void 0) {
	      value = '';
	    }
	    if (from === void 0) {
	      from = 0;
	    }
	    this.value = value;
	    this.from = from;
	    this.stop = stop;
	  }
	  toString() {
	    return this.value;
	  }
	  extend(tail) {
	    this.value += String(tail);
	  }
	  appendTo(masked) {
	    return masked.append(this.toString(), {
	      tail: true
	    }).aggregate(masked._appendPlaceholder());
	  }
	  get state() {
	    return {
	      value: this.value,
	      from: this.from,
	      stop: this.stop
	    };
	  }
	  set state(state) {
	    Object.assign(this, state);
	  }
	  unshift(beforePos) {
	    if (!this.value.length || beforePos != null && this.from >= beforePos) return '';
	    const shiftChar = this.value[0];
	    this.value = this.value.slice(1);
	    return shiftChar;
	  }
	  shift() {
	    if (!this.value.length) return '';
	    const shiftChar = this.value[this.value.length - 1];
	    this.value = this.value.slice(0, -1);
	    return shiftChar;
	  }
	}

	/** Append flags */

	/** Extract flags */

	// see https://github.com/microsoft/TypeScript/issues/6223

	/** Provides common masking stuff */
	class Masked {
	  /** */

	  /** */

	  /** Transforms value before mask processing */

	  /** Transforms each char before mask processing */

	  /** Validates if value is acceptable */

	  /** Does additional processing at the end of editing */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    this._value = '';
	    this._update({
	      ...Masked.DEFAULTS,
	      ...opts
	    });
	    this._initialized = true;
	  }

	  /** Sets and applies new options */
	  updateOptions(opts) {
	    if (!this.optionsIsChanged(opts)) return;
	    this.withValueRefresh(this._update.bind(this, opts));
	  }

	  /** Sets new options */
	  _update(opts) {
	    Object.assign(this, opts);
	  }

	  /** Mask state */
	  get state() {
	    return {
	      _value: this.value,
	      _rawInputValue: this.rawInputValue
	    };
	  }
	  set state(state) {
	    this._value = state._value;
	  }

	  /** Resets value */
	  reset() {
	    this._value = '';
	  }
	  get value() {
	    return this._value;
	  }
	  set value(value) {
	    this.resolve(value, {
	      input: true
	    });
	  }

	  /** Resolve new value */
	  resolve(value, flags) {
	    if (flags === void 0) {
	      flags = {
	        input: true
	      };
	    }
	    this.reset();
	    this.append(value, flags, '');
	    this.doCommit();
	  }
	  get unmaskedValue() {
	    return this.value;
	  }
	  set unmaskedValue(value) {
	    this.resolve(value, {});
	  }
	  get typedValue() {
	    return this.parse ? this.parse(this.value, this) : this.unmaskedValue;
	  }
	  set typedValue(value) {
	    if (this.format) {
	      this.value = this.format(value, this);
	    } else {
	      this.unmaskedValue = String(value);
	    }
	  }

	  /** Value that includes raw user input */
	  get rawInputValue() {
	    return this.extractInput(0, this.displayValue.length, {
	      raw: true
	    });
	  }
	  set rawInputValue(value) {
	    this.resolve(value, {
	      raw: true
	    });
	  }
	  get displayValue() {
	    return this.value;
	  }
	  get isComplete() {
	    return true;
	  }
	  get isFilled() {
	    return this.isComplete;
	  }

	  /** Finds nearest input position in direction */
	  nearestInputPos(cursorPos, direction) {
	    return cursorPos;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return Math.min(this.displayValue.length, toPos - fromPos);
	  }

	  /** Extracts value in range considering flags */
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return this.displayValue.slice(fromPos, toPos);
	  }

	  /** Extracts tail in range */
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
	  }

	  /** Appends tail */
	  appendTail(tail) {
	    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
	    return tail.appendTo(this);
	  }

	  /** Appends char */
	  _appendCharRaw(ch, flags) {
	    if (!ch) return new ChangeDetails();
	    this._value += ch;
	    return new ChangeDetails({
	      inserted: ch,
	      rawInserted: ch
	    });
	  }

	  /** Appends char */
	  _appendChar(ch, flags, checkTail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const consistentState = this.state;
	    let details;
	    [ch, details] = this.doPrepareChar(ch, flags);
	    if (ch) {
	      details = details.aggregate(this._appendCharRaw(ch, flags));

	      // TODO handle `skip`?

	      // try `autofix` lookahead
	      if (!details.rawInserted && this.autofix === 'pad') {
	        const noFixState = this.state;
	        this.state = consistentState;
	        let fixDetails = this.pad(flags);
	        const chDetails = this._appendCharRaw(ch, flags);
	        fixDetails = fixDetails.aggregate(chDetails);

	        // if fix was applied or
	        // if details are equal use skip restoring state optimization
	        if (chDetails.rawInserted || fixDetails.equals(details)) {
	          details = fixDetails;
	        } else {
	          this.state = noFixState;
	        }
	      }
	    }
	    if (details.inserted) {
	      let consistentTail;
	      let appended = this.doValidate(flags) !== false;
	      if (appended && checkTail != null) {
	        // validation ok, check tail
	        const beforeTailState = this.state;
	        if (this.overwrite === true) {
	          consistentTail = checkTail.state;
	          for (let i = 0; i < details.rawInserted.length; ++i) {
	            checkTail.unshift(this.displayValue.length - details.tailShift);
	          }
	        }
	        let tailDetails = this.appendTail(checkTail);
	        appended = tailDetails.rawInserted.length === checkTail.toString().length;

	        // not ok, try shift
	        if (!(appended && tailDetails.inserted) && this.overwrite === 'shift') {
	          this.state = beforeTailState;
	          consistentTail = checkTail.state;
	          for (let i = 0; i < details.rawInserted.length; ++i) {
	            checkTail.shift();
	          }
	          tailDetails = this.appendTail(checkTail);
	          appended = tailDetails.rawInserted.length === checkTail.toString().length;
	        }

	        // if ok, rollback state after tail
	        if (appended && tailDetails.inserted) this.state = beforeTailState;
	      }

	      // revert all if something went wrong
	      if (!appended) {
	        details = new ChangeDetails();
	        this.state = consistentState;
	        if (checkTail && consistentTail) checkTail.state = consistentTail;
	      }
	    }
	    return details;
	  }

	  /** Appends optional placeholder at the end */
	  _appendPlaceholder() {
	    return new ChangeDetails();
	  }

	  /** Appends optional eager placeholder at the end */
	  _appendEager() {
	    return new ChangeDetails();
	  }

	  /** Appends symbols considering flags */
	  append(str, flags, tail) {
	    if (!isString(str)) throw new Error('value should be string');
	    const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
	    if (flags != null && flags.tail) flags._beforeTailState = this.state;
	    let details;
	    [str, details] = this.doPrepare(str, flags);
	    for (let ci = 0; ci < str.length; ++ci) {
	      const d = this._appendChar(str[ci], flags, checkTail);
	      if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
	      details.aggregate(d);
	    }
	    if ((this.eager === true || this.eager === 'append') && flags != null && flags.input && str) {
	      details.aggregate(this._appendEager());
	    }

	    // append tail but aggregate only tailShift
	    if (checkTail != null) {
	      details.tailShift += this.appendTail(checkTail).tailShift;
	      // TODO it's a good idea to clear state after appending ends
	      // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
	      // this._resetBeforeTailState();
	    }
	    return details;
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    this._value = this.displayValue.slice(0, fromPos) + this.displayValue.slice(toPos);
	    return new ChangeDetails();
	  }

	  /** Calls function and reapplies current value */
	  withValueRefresh(fn) {
	    if (this._refreshing || !this._initialized) return fn();
	    this._refreshing = true;
	    const rawInput = this.rawInputValue;
	    const value = this.value;
	    const ret = fn();
	    this.rawInputValue = rawInput;
	    // append lost trailing chars at the end
	    if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
	      this.append(value.slice(this.displayValue.length), {}, '');
	      this.doCommit();
	    }
	    delete this._refreshing;
	    return ret;
	  }
	  runIsolated(fn) {
	    if (this._isolated || !this._initialized) return fn(this);
	    this._isolated = true;
	    const state = this.state;
	    const ret = fn(this);
	    this.state = state;
	    delete this._isolated;
	    return ret;
	  }
	  doSkipInvalid(ch, flags, checkTail) {
	    return Boolean(this.skipInvalid);
	  }

	  /** Prepares string before mask processing */
	  doPrepare(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    return ChangeDetails.normalize(this.prepare ? this.prepare(str, this, flags) : str);
	  }

	  /** Prepares each char before mask processing */
	  doPrepareChar(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    return ChangeDetails.normalize(this.prepareChar ? this.prepareChar(str, this, flags) : str);
	  }

	  /** Validates if value is acceptable */
	  doValidate(flags) {
	    return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
	  }

	  /** Does additional processing at the end of editing */
	  doCommit() {
	    if (this.commit) this.commit(this.value, this);
	  }
	  splice(start, deleteCount, inserted, removeDirection, flags) {
	    if (inserted === void 0) {
	      inserted = '';
	    }
	    if (removeDirection === void 0) {
	      removeDirection = DIRECTION.NONE;
	    }
	    if (flags === void 0) {
	      flags = {
	        input: true
	      };
	    }
	    const tailPos = start + deleteCount;
	    const tail = this.extractTail(tailPos);
	    const eagerRemove = this.eager === true || this.eager === 'remove';
	    let oldRawValue;
	    if (eagerRemove) {
	      removeDirection = forceDirection(removeDirection);
	      oldRawValue = this.extractInput(0, tailPos, {
	        raw: true
	      });
	    }
	    let startChangePos = start;
	    const details = new ChangeDetails();

	    // if it is just deletion without insertion
	    if (removeDirection !== DIRECTION.NONE) {
	      startChangePos = this.nearestInputPos(start, deleteCount > 1 && start !== 0 && !eagerRemove ? DIRECTION.NONE : removeDirection);

	      // adjust tailShift if start was aligned
	      details.tailShift = startChangePos - start;
	    }
	    details.aggregate(this.remove(startChangePos));
	    if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) {
	      if (removeDirection === DIRECTION.FORCE_LEFT) {
	        let valLength;
	        while (oldRawValue === this.rawInputValue && (valLength = this.displayValue.length)) {
	          details.aggregate(new ChangeDetails({
	            tailShift: -1
	          })).aggregate(this.remove(valLength - 1));
	        }
	      } else if (removeDirection === DIRECTION.FORCE_RIGHT) {
	        tail.unshift();
	      }
	    }
	    return details.aggregate(this.append(inserted, flags, tail));
	  }
	  maskEquals(mask) {
	    return this.mask === mask;
	  }
	  optionsIsChanged(opts) {
	    return !objectIncludes(this, opts);
	  }
	  typedValueEquals(value) {
	    const tval = this.typedValue;
	    return value === tval || Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) || (this.format ? this.format(value, this) === this.format(this.typedValue, this) : false);
	  }
	  pad(flags) {
	    return new ChangeDetails();
	  }
	}
	Masked.DEFAULTS = {
	  skipInvalid: true
	};
	Masked.EMPTY_VALUES = [undefined, null, ''];
	IMask.Masked = Masked;

	class ChunksTailDetails {
	  /** */

	  constructor(chunks, from) {
	    if (chunks === void 0) {
	      chunks = [];
	    }
	    if (from === void 0) {
	      from = 0;
	    }
	    this.chunks = chunks;
	    this.from = from;
	  }
	  toString() {
	    return this.chunks.map(String).join('');
	  }
	  extend(tailChunk) {
	    if (!String(tailChunk)) return;
	    tailChunk = isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk;
	    const lastChunk = this.chunks[this.chunks.length - 1];
	    const extendLast = lastChunk && (
	    // if stops are same or tail has no stop
	    lastChunk.stop === tailChunk.stop || tailChunk.stop == null) &&
	    // if tail chunk goes just after last chunk
	    tailChunk.from === lastChunk.from + lastChunk.toString().length;
	    if (tailChunk instanceof ContinuousTailDetails) {
	      // check the ability to extend previous chunk
	      if (extendLast) {
	        // extend previous chunk
	        lastChunk.extend(tailChunk.toString());
	      } else {
	        // append new chunk
	        this.chunks.push(tailChunk);
	      }
	    } else if (tailChunk instanceof ChunksTailDetails) {
	      if (tailChunk.stop == null) {
	        // unwrap floating chunks to parent, keeping `from` pos
	        let firstTailChunk;
	        while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
	          firstTailChunk = tailChunk.chunks.shift(); // not possible to be `undefined` because length was checked above
	          firstTailChunk.from += tailChunk.from;
	          this.extend(firstTailChunk);
	        }
	      }

	      // if tail chunk still has value
	      if (tailChunk.toString()) {
	        // if chunks contains stops, then popup stop to container
	        tailChunk.stop = tailChunk.blockIndex;
	        this.chunks.push(tailChunk);
	      }
	    }
	  }
	  appendTo(masked) {
	    if (!(masked instanceof IMask.MaskedPattern)) {
	      const tail = new ContinuousTailDetails(this.toString());
	      return tail.appendTo(masked);
	    }
	    const details = new ChangeDetails();
	    for (let ci = 0; ci < this.chunks.length; ++ci) {
	      const chunk = this.chunks[ci];
	      const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
	      const stop = chunk.stop;
	      let chunkBlock;
	      if (stop != null && (
	      // if block not found or stop is behind lastBlock
	      !lastBlockIter || lastBlockIter.index <= stop)) {
	        if (chunk instanceof ChunksTailDetails ||
	        // for continuous block also check if stop is exist
	        masked._stops.indexOf(stop) >= 0) {
	          details.aggregate(masked._appendPlaceholder(stop));
	        }
	        chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
	      }
	      if (chunkBlock) {
	        const tailDetails = chunkBlock.appendTail(chunk);
	        details.aggregate(tailDetails);

	        // get not inserted chars
	        const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
	        if (remainChars) details.aggregate(masked.append(remainChars, {
	          tail: true
	        }));
	      } else {
	        details.aggregate(masked.append(chunk.toString(), {
	          tail: true
	        }));
	      }
	    }
	    return details;
	  }
	  get state() {
	    return {
	      chunks: this.chunks.map(c => c.state),
	      from: this.from,
	      stop: this.stop,
	      blockIndex: this.blockIndex
	    };
	  }
	  set state(state) {
	    const {
	      chunks,
	      ...props
	    } = state;
	    Object.assign(this, props);
	    this.chunks = chunks.map(cstate => {
	      const chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails();
	      chunk.state = cstate;
	      return chunk;
	    });
	  }
	  unshift(beforePos) {
	    if (!this.chunks.length || beforePos != null && this.from >= beforePos) return '';
	    const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
	    let ci = 0;
	    while (ci < this.chunks.length) {
	      const chunk = this.chunks[ci];
	      const shiftChar = chunk.unshift(chunkShiftPos);
	      if (chunk.toString()) {
	        // chunk still contains value
	        // but not shifted - means no more available chars to shift
	        if (!shiftChar) break;
	        ++ci;
	      } else {
	        // clean if chunk has no value
	        this.chunks.splice(ci, 1);
	      }
	      if (shiftChar) return shiftChar;
	    }
	    return '';
	  }
	  shift() {
	    if (!this.chunks.length) return '';
	    let ci = this.chunks.length - 1;
	    while (0 <= ci) {
	      const chunk = this.chunks[ci];
	      const shiftChar = chunk.shift();
	      if (chunk.toString()) {
	        // chunk still contains value
	        // but not shifted - means no more available chars to shift
	        if (!shiftChar) break;
	        --ci;
	      } else {
	        // clean if chunk has no value
	        this.chunks.splice(ci, 1);
	      }
	      if (shiftChar) return shiftChar;
	    }
	    return '';
	  }
	}

	class PatternCursor {
	  constructor(masked, pos) {
	    this.masked = masked;
	    this._log = [];
	    const {
	      offset,
	      index
	    } = masked._mapPosToBlock(pos) || (pos < 0 ?
	    // first
	    {
	      index: 0,
	      offset: 0
	    } :
	    // last
	    {
	      index: this.masked._blocks.length,
	      offset: 0
	    });
	    this.offset = offset;
	    this.index = index;
	    this.ok = false;
	  }
	  get block() {
	    return this.masked._blocks[this.index];
	  }
	  get pos() {
	    return this.masked._blockStartPos(this.index) + this.offset;
	  }
	  get state() {
	    return {
	      index: this.index,
	      offset: this.offset,
	      ok: this.ok
	    };
	  }
	  set state(s) {
	    Object.assign(this, s);
	  }
	  pushState() {
	    this._log.push(this.state);
	  }
	  popState() {
	    const s = this._log.pop();
	    if (s) this.state = s;
	    return s;
	  }
	  bindBlock() {
	    if (this.block) return;
	    if (this.index < 0) {
	      this.index = 0;
	      this.offset = 0;
	    }
	    if (this.index >= this.masked._blocks.length) {
	      this.index = this.masked._blocks.length - 1;
	      this.offset = this.block.displayValue.length; // TODO this is stupid type error, `block` depends on index that was changed above
	    }
	  }
	  _pushLeft(fn) {
	    this.pushState();
	    for (this.bindBlock(); 0 <= this.index; --this.index, this.offset = ((_this$block = this.block) == null ? void 0 : _this$block.displayValue.length) || 0) {
	      var _this$block;
	      if (fn()) return this.ok = true;
	    }
	    return this.ok = false;
	  }
	  _pushRight(fn) {
	    this.pushState();
	    for (this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) {
	      if (fn()) return this.ok = true;
	    }
	    return this.ok = false;
	  }
	  pushLeftBeforeFilled() {
	    return this._pushLeft(() => {
	      if (this.block.isFixed || !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
	      if (this.offset !== 0) return true;
	    });
	  }
	  pushLeftBeforeInput() {
	    // cases:
	    // filled input: 00|
	    // optional empty input: 00[]|
	    // nested block: XX<[]>|
	    return this._pushLeft(() => {
	      if (this.block.isFixed) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
	      return true;
	    });
	  }
	  pushLeftBeforeRequired() {
	    return this._pushLeft(() => {
	      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
	      return true;
	    });
	  }
	  pushRightBeforeFilled() {
	    return this._pushRight(() => {
	      if (this.block.isFixed || !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
	      if (this.offset !== this.block.value.length) return true;
	    });
	  }
	  pushRightBeforeInput() {
	    return this._pushRight(() => {
	      if (this.block.isFixed) return;

	      // const o = this.offset;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
	      // HACK cases like (STILL DOES NOT WORK FOR NESTED)
	      // aa|X
	      // aa<X|[]>X_    - this will not work
	      // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
	      return true;
	    });
	  }
	  pushRightBeforeRequired() {
	    return this._pushRight(() => {
	      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;

	      // TODO check |[*]XX_
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
	      return true;
	    });
	  }
	}

	class PatternFixedDefinition {
	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    Object.assign(this, opts);
	    this._value = '';
	    this.isFixed = true;
	  }
	  get value() {
	    return this._value;
	  }
	  get unmaskedValue() {
	    return this.isUnmasking ? this.value : '';
	  }
	  get rawInputValue() {
	    return this._isRawInput ? this.value : '';
	  }
	  get displayValue() {
	    return this.value;
	  }
	  reset() {
	    this._isRawInput = false;
	    this._value = '';
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
	    if (!this._value) this._isRawInput = false;
	    return new ChangeDetails();
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    const minPos = 0;
	    const maxPos = this._value.length;
	    switch (direction) {
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        return minPos;
	      case DIRECTION.NONE:
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	      default:
	        return maxPos;
	    }
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    return this._isRawInput ? toPos - fromPos : 0;
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
	  }
	  get isComplete() {
	    return true;
	  }
	  get isFilled() {
	    return Boolean(this._value);
	  }
	  _appendChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (this.isFilled) return new ChangeDetails();
	    const appendEager = this.eager === true || this.eager === 'append';
	    const appended = this.char === ch;
	    const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && (!flags.raw || !appendEager) && !flags.tail;
	    const details = new ChangeDetails({
	      inserted: this.char,
	      rawInserted: isResolved ? this.char : ''
	    });
	    this._value = this.char;
	    this._isRawInput = isResolved && (flags.raw || flags.input);
	    return details;
	  }
	  _appendEager() {
	    return this._appendChar(this.char, {
	      tail: true
	    });
	  }
	  _appendPlaceholder() {
	    const details = new ChangeDetails();
	    if (this.isFilled) return details;
	    this._value = details.inserted = this.char;
	    return details;
	  }
	  extractTail() {
	    return new ContinuousTailDetails('');
	  }
	  appendTail(tail) {
	    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
	    return tail.appendTo(this);
	  }
	  append(str, flags, tail) {
	    const details = this._appendChar(str[0], flags);
	    if (tail != null) {
	      details.tailShift += this.appendTail(tail).tailShift;
	    }
	    return details;
	  }
	  doCommit() {}
	  get state() {
	    return {
	      _value: this._value,
	      _rawInputValue: this.rawInputValue
	    };
	  }
	  set state(state) {
	    this._value = state._value;
	    this._isRawInput = Boolean(state._rawInputValue);
	  }
	  pad(flags) {
	    return this._appendPlaceholder();
	  }
	}

	class PatternInputDefinition {
	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    const {
	      parent,
	      isOptional,
	      placeholderChar,
	      displayChar,
	      lazy,
	      eager,
	      ...maskOpts
	    } = opts;
	    this.masked = createMask(maskOpts);
	    Object.assign(this, {
	      parent,
	      isOptional,
	      placeholderChar,
	      displayChar,
	      lazy,
	      eager
	    });
	  }
	  reset() {
	    this.isFilled = false;
	    this.masked.reset();
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    if (fromPos === 0 && toPos >= 1) {
	      this.isFilled = false;
	      return this.masked.remove(fromPos, toPos);
	    }
	    return new ChangeDetails();
	  }
	  get value() {
	    return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : '');
	  }
	  get unmaskedValue() {
	    return this.masked.unmaskedValue;
	  }
	  get rawInputValue() {
	    return this.masked.rawInputValue;
	  }
	  get displayValue() {
	    return this.masked.value && this.displayChar || this.value;
	  }
	  get isComplete() {
	    return Boolean(this.masked.value) || this.isOptional;
	  }
	  _appendChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (this.isFilled) return new ChangeDetails();
	    const state = this.masked.state;
	    // simulate input
	    let details = this.masked._appendChar(ch, this.currentMaskFlags(flags));
	    if (details.inserted && this.doValidate(flags) === false) {
	      details = new ChangeDetails();
	      this.masked.state = state;
	    }
	    if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
	      details.inserted = this.placeholderChar;
	    }
	    details.skip = !details.inserted && !this.isOptional;
	    this.isFilled = Boolean(details.inserted);
	    return details;
	  }
	  append(str, flags, tail) {
	    // TODO probably should be done via _appendChar
	    return this.masked.append(str, this.currentMaskFlags(flags), tail);
	  }
	  _appendPlaceholder() {
	    if (this.isFilled || this.isOptional) return new ChangeDetails();
	    this.isFilled = true;
	    return new ChangeDetails({
	      inserted: this.placeholderChar
	    });
	  }
	  _appendEager() {
	    return new ChangeDetails();
	  }
	  extractTail(fromPos, toPos) {
	    return this.masked.extractTail(fromPos, toPos);
	  }
	  appendTail(tail) {
	    return this.masked.appendTail(tail);
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    return this.masked.extractInput(fromPos, toPos, flags);
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    const minPos = 0;
	    const maxPos = this.value.length;
	    const boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);
	    switch (direction) {
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        return this.isComplete ? boundPos : minPos;
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	        return this.isComplete ? boundPos : maxPos;
	      case DIRECTION.NONE:
	      default:
	        return boundPos;
	    }
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    return this.value.slice(fromPos, toPos).length;
	  }
	  doValidate(flags) {
	    return this.masked.doValidate(this.currentMaskFlags(flags)) && (!this.parent || this.parent.doValidate(this.currentMaskFlags(flags)));
	  }
	  doCommit() {
	    this.masked.doCommit();
	  }
	  get state() {
	    return {
	      _value: this.value,
	      _rawInputValue: this.rawInputValue,
	      masked: this.masked.state,
	      isFilled: this.isFilled
	    };
	  }
	  set state(state) {
	    this.masked.state = state.masked;
	    this.isFilled = state.isFilled;
	  }
	  currentMaskFlags(flags) {
	    var _flags$_beforeTailSta;
	    return {
	      ...flags,
	      _beforeTailState: (flags == null || (_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.masked) || (flags == null ? void 0 : flags._beforeTailState)
	    };
	  }
	  pad(flags) {
	    return new ChangeDetails();
	  }
	}
	PatternInputDefinition.DEFAULT_DEFINITIONS = {
	  '0': /\d/,
	  'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
	  // http://stackoverflow.com/a/22075070
	  '*': /./
	};

	/** Masking by RegExp */
	class MaskedRegExp extends Masked {
	  /** */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const mask = opts.mask;
	    if (mask) opts.validate = value => value.search(mask) >= 0;
	    super._update(opts);
	  }
	}
	IMask.MaskedRegExp = MaskedRegExp;

	/** Pattern mask */
	class MaskedPattern extends Masked {
	  /** */

	  /** */

	  /** Single char for empty input */

	  /** Single char for filled input */

	  /** Show placeholder only when needed */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    super({
	      ...MaskedPattern.DEFAULTS,
	      ...opts,
	      definitions: Object.assign({}, PatternInputDefinition.DEFAULT_DEFINITIONS, opts == null ? void 0 : opts.definitions)
	    });
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    opts.definitions = Object.assign({}, this.definitions, opts.definitions);
	    super._update(opts);
	    this._rebuildMask();
	  }
	  _rebuildMask() {
	    const defs = this.definitions;
	    this._blocks = [];
	    this.exposeBlock = undefined;
	    this._stops = [];
	    this._maskedBlocks = {};
	    const pattern = this.mask;
	    if (!pattern || !defs) return;
	    let unmaskingBlock = false;
	    let optionalBlock = false;
	    for (let i = 0; i < pattern.length; ++i) {
	      if (this.blocks) {
	        const p = pattern.slice(i);
	        const bNames = Object.keys(this.blocks).filter(bName => p.indexOf(bName) === 0);
	        // order by key length
	        bNames.sort((a, b) => b.length - a.length);
	        // use block name with max length
	        const bName = bNames[0];
	        if (bName) {
	          const {
	            expose,
	            repeat,
	            ...bOpts
	          } = normalizeOpts(this.blocks[bName]); // TODO type Opts<Arg & Extra>
	          const blockOpts = {
	            lazy: this.lazy,
	            eager: this.eager,
	            placeholderChar: this.placeholderChar,
	            displayChar: this.displayChar,
	            overwrite: this.overwrite,
	            autofix: this.autofix,
	            ...bOpts,
	            repeat,
	            parent: this
	          };
	          const maskedBlock = repeat != null ? new IMask.RepeatBlock(blockOpts /* TODO */) : createMask(blockOpts);
	          if (maskedBlock) {
	            this._blocks.push(maskedBlock);
	            if (expose) this.exposeBlock = maskedBlock;

	            // store block index
	            if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
	            this._maskedBlocks[bName].push(this._blocks.length - 1);
	          }
	          i += bName.length - 1;
	          continue;
	        }
	      }
	      let char = pattern[i];
	      let isInput = (char in defs);
	      if (char === MaskedPattern.STOP_CHAR) {
	        this._stops.push(this._blocks.length);
	        continue;
	      }
	      if (char === '{' || char === '}') {
	        unmaskingBlock = !unmaskingBlock;
	        continue;
	      }
	      if (char === '[' || char === ']') {
	        optionalBlock = !optionalBlock;
	        continue;
	      }
	      if (char === MaskedPattern.ESCAPE_CHAR) {
	        ++i;
	        char = pattern[i];
	        if (!char) break;
	        isInput = false;
	      }
	      const def = isInput ? new PatternInputDefinition({
	        isOptional: optionalBlock,
	        lazy: this.lazy,
	        eager: this.eager,
	        placeholderChar: this.placeholderChar,
	        displayChar: this.displayChar,
	        ...normalizeOpts(defs[char]),
	        parent: this
	      }) : new PatternFixedDefinition({
	        char,
	        eager: this.eager,
	        isUnmasking: unmaskingBlock
	      });
	      this._blocks.push(def);
	    }
	  }
	  get state() {
	    return {
	      ...super.state,
	      _blocks: this._blocks.map(b => b.state)
	    };
	  }
	  set state(state) {
	    if (!state) {
	      this.reset();
	      return;
	    }
	    const {
	      _blocks,
	      ...maskedState
	    } = state;
	    this._blocks.forEach((b, bi) => b.state = _blocks[bi]);
	    super.state = maskedState;
	  }
	  reset() {
	    super.reset();
	    this._blocks.forEach(b => b.reset());
	  }
	  get isComplete() {
	    return this.exposeBlock ? this.exposeBlock.isComplete : this._blocks.every(b => b.isComplete);
	  }
	  get isFilled() {
	    return this._blocks.every(b => b.isFilled);
	  }
	  get isFixed() {
	    return this._blocks.every(b => b.isFixed);
	  }
	  get isOptional() {
	    return this._blocks.every(b => b.isOptional);
	  }
	  doCommit() {
	    this._blocks.forEach(b => b.doCommit());
	    super.doCommit();
	  }
	  get unmaskedValue() {
	    return this.exposeBlock ? this.exposeBlock.unmaskedValue : this._blocks.reduce((str, b) => str += b.unmaskedValue, '');
	  }
	  set unmaskedValue(unmaskedValue) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.unmaskedValue = unmaskedValue;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.unmaskedValue = unmaskedValue;
	  }
	  get value() {
	    return this.exposeBlock ? this.exposeBlock.value :
	    // TODO return _value when not in change?
	    this._blocks.reduce((str, b) => str += b.value, '');
	  }
	  set value(value) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.value = value;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.value = value;
	  }
	  get typedValue() {
	    return this.exposeBlock ? this.exposeBlock.typedValue : super.typedValue;
	  }
	  set typedValue(value) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.typedValue = value;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.typedValue = value;
	  }
	  get displayValue() {
	    return this._blocks.reduce((str, b) => str += b.displayValue, '');
	  }
	  appendTail(tail) {
	    return super.appendTail(tail).aggregate(this._appendPlaceholder());
	  }
	  _appendEager() {
	    var _this$_mapPosToBlock;
	    const details = new ChangeDetails();
	    let startBlockIndex = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index;
	    if (startBlockIndex == null) return details;

	    // TODO test if it works for nested pattern masks
	    if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;
	    for (let bi = startBlockIndex; bi < this._blocks.length; ++bi) {
	      const d = this._blocks[bi]._appendEager();
	      if (!d.inserted) break;
	      details.aggregate(d);
	    }
	    return details;
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const blockIter = this._mapPosToBlock(this.displayValue.length);
	    const details = new ChangeDetails();
	    if (!blockIter) return details;
	    for (let bi = blockIter.index, block; block = this._blocks[bi]; ++bi) {
	      var _flags$_beforeTailSta;
	      const blockDetails = block._appendChar(ch, {
	        ...flags,
	        _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
	      });
	      details.aggregate(blockDetails);
	      if (blockDetails.consumed) break; // go next char
	    }
	    return details;
	  }
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const chunkTail = new ChunksTailDetails();
	    if (fromPos === toPos) return chunkTail;
	    this._forEachBlocksInRange(fromPos, toPos, (b, bi, bFromPos, bToPos) => {
	      const blockChunk = b.extractTail(bFromPos, bToPos);
	      blockChunk.stop = this._findStopBefore(bi);
	      blockChunk.from = this._blockStartPos(bi);
	      if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
	      chunkTail.extend(blockChunk);
	    });
	    return chunkTail;
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (fromPos === toPos) return '';
	    let input = '';
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
	      input += b.extractInput(fromPos, toPos, flags);
	    });
	    return input;
	  }
	  _findStopBefore(blockIndex) {
	    let stopBefore;
	    for (let si = 0; si < this._stops.length; ++si) {
	      const stop = this._stops[si];
	      if (stop <= blockIndex) stopBefore = stop;else break;
	    }
	    return stopBefore;
	  }

	  /** Appends placeholder depending on laziness */
	  _appendPlaceholder(toBlockIndex) {
	    const details = new ChangeDetails();
	    if (this.lazy && toBlockIndex == null) return details;
	    const startBlockIter = this._mapPosToBlock(this.displayValue.length);
	    if (!startBlockIter) return details;
	    const startBlockIndex = startBlockIter.index;
	    const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;
	    this._blocks.slice(startBlockIndex, endBlockIndex).forEach(b => {
	      if (!b.lazy || toBlockIndex != null) {
	        var _blocks2;
	        details.aggregate(b._appendPlaceholder((_blocks2 = b._blocks) == null ? void 0 : _blocks2.length));
	      }
	    });
	    return details;
	  }

	  /** Finds block in pos */
	  _mapPosToBlock(pos) {
	    let accVal = '';
	    for (let bi = 0; bi < this._blocks.length; ++bi) {
	      const block = this._blocks[bi];
	      const blockStartPos = accVal.length;
	      accVal += block.displayValue;
	      if (pos <= accVal.length) {
	        return {
	          index: bi,
	          offset: pos - blockStartPos
	        };
	      }
	    }
	  }
	  _blockStartPos(blockIndex) {
	    return this._blocks.slice(0, blockIndex).reduce((pos, b) => pos += b.displayValue.length, 0);
	  }
	  _forEachBlocksInRange(fromPos, toPos, fn) {
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const fromBlockIter = this._mapPosToBlock(fromPos);
	    if (fromBlockIter) {
	      const toBlockIter = this._mapPosToBlock(toPos);
	      // process first block
	      const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
	      const fromBlockStartPos = fromBlockIter.offset;
	      const fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].displayValue.length;
	      fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);
	      if (toBlockIter && !isSameBlock) {
	        // process intermediate blocks
	        for (let bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
	          fn(this._blocks[bi], bi, 0, this._blocks[bi].displayValue.length);
	        }

	        // process last block
	        fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
	      }
	    }
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const removeDetails = super.remove(fromPos, toPos);
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
	      removeDetails.aggregate(b.remove(bFromPos, bToPos));
	    });
	    return removeDetails;
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    if (!this._blocks.length) return 0;
	    const cursor = new PatternCursor(this, cursorPos);
	    if (direction === DIRECTION.NONE) {
	      // -------------------------------------------------
	      // NONE should only go out from fixed to the right!
	      // -------------------------------------------------
	      if (cursor.pushRightBeforeInput()) return cursor.pos;
	      cursor.popState();
	      if (cursor.pushLeftBeforeInput()) return cursor.pos;
	      return this.displayValue.length;
	    }

	    // FORCE is only about a|* otherwise is 0
	    if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
	      // try to break fast when *|a
	      if (direction === DIRECTION.LEFT) {
	        cursor.pushRightBeforeFilled();
	        if (cursor.ok && cursor.pos === cursorPos) return cursorPos;
	        cursor.popState();
	      }

	      // forward flow
	      cursor.pushLeftBeforeInput();
	      cursor.pushLeftBeforeRequired();
	      cursor.pushLeftBeforeFilled();

	      // backward flow
	      if (direction === DIRECTION.LEFT) {
	        cursor.pushRightBeforeInput();
	        cursor.pushRightBeforeRequired();
	        if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
	        cursor.popState();
	        if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
	        cursor.popState();
	      }
	      if (cursor.ok) return cursor.pos;
	      if (direction === DIRECTION.FORCE_LEFT) return 0;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      return 0;
	    }
	    if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
	      // forward flow
	      cursor.pushRightBeforeInput();
	      cursor.pushRightBeforeRequired();
	      if (cursor.pushRightBeforeFilled()) return cursor.pos;
	      if (direction === DIRECTION.FORCE_RIGHT) return this.displayValue.length;

	      // backward flow
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      return this.nearestInputPos(cursorPos, DIRECTION.LEFT);
	    }
	    return cursorPos;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    let total = 0;
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
	      total += b.totalInputPositions(bFromPos, bToPos);
	    });
	    return total;
	  }

	  /** Get block by name */
	  maskedBlock(name) {
	    return this.maskedBlocks(name)[0];
	  }

	  /** Get all blocks by name */
	  maskedBlocks(name) {
	    const indices = this._maskedBlocks[name];
	    if (!indices) return [];
	    return indices.map(gi => this._blocks[gi]);
	  }
	  pad(flags) {
	    const details = new ChangeDetails();
	    this._forEachBlocksInRange(0, this.displayValue.length, b => details.aggregate(b.pad(flags)));
	    return details;
	  }
	}
	MaskedPattern.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  lazy: true,
	  placeholderChar: '_'
	};
	MaskedPattern.STOP_CHAR = '`';
	MaskedPattern.ESCAPE_CHAR = '\\';
	MaskedPattern.InputDefinition = PatternInputDefinition;
	MaskedPattern.FixedDefinition = PatternFixedDefinition;
	IMask.MaskedPattern = MaskedPattern;

	/** Pattern which accepts ranges */
	class MaskedRange extends MaskedPattern {
	  /**
	    Optionally sets max length of pattern.
	    Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
	  */

	  /** Min bound */

	  /** Max bound */

	  get _matchFrom() {
	    return this.maxLength - String(this.from).length;
	  }
	  constructor(opts) {
	    super(opts); // mask will be created in _update
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      to = this.to || 0,
	      from = this.from || 0,
	      maxLength = this.maxLength || 0,
	      autofix = this.autofix,
	      ...patternOpts
	    } = opts;
	    this.to = to;
	    this.from = from;
	    this.maxLength = Math.max(String(to).length, maxLength);
	    this.autofix = autofix;
	    const fromStr = String(this.from).padStart(this.maxLength, '0');
	    const toStr = String(this.to).padStart(this.maxLength, '0');
	    let sameCharsCount = 0;
	    while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
	    patternOpts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(this.maxLength - sameCharsCount);
	    super._update(patternOpts);
	  }
	  get isComplete() {
	    return super.isComplete && Boolean(this.value);
	  }
	  boundaries(str) {
	    let minstr = '';
	    let maxstr = '';
	    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
	    if (num) {
	      minstr = '0'.repeat(placeholder.length) + num;
	      maxstr = '9'.repeat(placeholder.length) + num;
	    }
	    minstr = minstr.padEnd(this.maxLength, '0');
	    maxstr = maxstr.padEnd(this.maxLength, '9');
	    return [minstr, maxstr];
	  }
	  doPrepareChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let details;
	    [ch, details] = super.doPrepareChar(ch.replace(/\D/g, ''), flags);
	    if (!ch) details.skip = !this.isComplete;
	    return [ch, details];
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (!this.autofix || this.value.length + 1 > this.maxLength) return super._appendCharRaw(ch, flags);
	    const fromStr = String(this.from).padStart(this.maxLength, '0');
	    const toStr = String(this.to).padStart(this.maxLength, '0');
	    const [minstr, maxstr] = this.boundaries(this.value + ch);
	    if (Number(maxstr) < this.from) return super._appendCharRaw(fromStr[this.value.length], flags);
	    if (Number(minstr) > this.to) {
	      if (!flags.tail && this.autofix === 'pad' && this.value.length + 1 < this.maxLength) {
	        return super._appendCharRaw(fromStr[this.value.length], flags).aggregate(this._appendCharRaw(ch, flags));
	      }
	      return super._appendCharRaw(toStr[this.value.length], flags);
	    }
	    return super._appendCharRaw(ch, flags);
	  }
	  doValidate(flags) {
	    const str = this.value;
	    const firstNonZero = str.search(/[^0]/);
	    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;
	    const [minstr, maxstr] = this.boundaries(str);
	    return this.from <= Number(maxstr) && Number(minstr) <= this.to && super.doValidate(flags);
	  }
	  pad(flags) {
	    const details = new ChangeDetails();
	    if (this.value.length === this.maxLength) return details;
	    const value = this.value;
	    const padLength = this.maxLength - this.value.length;
	    if (padLength) {
	      this.reset();
	      for (let i = 0; i < padLength; ++i) {
	        details.aggregate(super._appendCharRaw('0', flags));
	      }

	      // append tail
	      value.split('').forEach(ch => this._appendCharRaw(ch));
	    }
	    return details;
	  }
	}
	IMask.MaskedRange = MaskedRange;

	const DefaultPattern = 'd{.}`m{.}`Y';

	// Make format and parse required when pattern is provided

	/** Date mask */
	class MaskedDate extends MaskedPattern {
	  static extractPatternOptions(opts) {
	    const {
	      mask,
	      pattern,
	      ...patternOpts
	    } = opts;
	    return {
	      ...patternOpts,
	      mask: isString(mask) ? mask : pattern
	    };
	  }

	  /** Pattern mask for date according to {@link MaskedDate#format} */

	  /** Start date */

	  /** End date */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  constructor(opts) {
	    super(MaskedDate.extractPatternOptions({
	      ...MaskedDate.DEFAULTS,
	      ...opts
	    }));
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      mask,
	      pattern,
	      blocks,
	      ...patternOpts
	    } = {
	      ...MaskedDate.DEFAULTS,
	      ...opts
	    };
	    const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
	    // adjust year block
	    if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
	    if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
	    if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to) {
	      patternBlocks.m.from = opts.min.getMonth() + 1;
	      patternBlocks.m.to = opts.max.getMonth() + 1;
	      if (patternBlocks.m.from === patternBlocks.m.to) {
	        patternBlocks.d.from = opts.min.getDate();
	        patternBlocks.d.to = opts.max.getDate();
	      }
	    }
	    Object.assign(patternBlocks, this.blocks, blocks);
	    super._update({
	      ...patternOpts,
	      mask: isString(mask) ? mask : pattern,
	      blocks: patternBlocks
	    });
	  }
	  doValidate(flags) {
	    const date = this.date;
	    return super.doValidate(flags) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
	  }

	  /** Checks if date is exists */
	  isDateExist(str) {
	    return this.format(this.parse(str, this), this).indexOf(str) >= 0;
	  }

	  /** Parsed Date */
	  get date() {
	    return this.typedValue;
	  }
	  set date(date) {
	    this.typedValue = date;
	  }
	  get typedValue() {
	    return this.isComplete ? super.typedValue : null;
	  }
	  set typedValue(value) {
	    super.typedValue = value;
	  }
	  maskEquals(mask) {
	    return mask === Date || super.maskEquals(mask);
	  }
	  optionsIsChanged(opts) {
	    return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
	  }
	}
	MaskedDate.GET_DEFAULT_BLOCKS = () => ({
	  d: {
	    mask: MaskedRange,
	    from: 1,
	    to: 31,
	    maxLength: 2
	  },
	  m: {
	    mask: MaskedRange,
	    from: 1,
	    to: 12,
	    maxLength: 2
	  },
	  Y: {
	    mask: MaskedRange,
	    from: 1900,
	    to: 9999
	  }
	});
	MaskedDate.DEFAULTS = {
	  ...MaskedPattern.DEFAULTS,
	  mask: Date,
	  pattern: DefaultPattern,
	  format: (date, masked) => {
	    if (!date) return '';
	    const day = String(date.getDate()).padStart(2, '0');
	    const month = String(date.getMonth() + 1).padStart(2, '0');
	    const year = date.getFullYear();
	    return [day, month, year].join('.');
	  },
	  parse: (str, masked) => {
	    const [day, month, year] = str.split('.').map(Number);
	    return new Date(year, month - 1, day);
	  }
	};
	IMask.MaskedDate = MaskedDate;

	/** Dynamic mask for choosing appropriate mask in run-time */
	class MaskedDynamic extends Masked {
	  constructor(opts) {
	    super({
	      ...MaskedDynamic.DEFAULTS,
	      ...opts
	    });
	    this.currentMask = undefined;
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update(opts);
	    if ('mask' in opts) {
	      this.exposeMask = undefined;
	      // mask could be totally dynamic with only `dispatch` option
	      this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(m => {
	        const {
	          expose,
	          ...maskOpts
	        } = normalizeOpts(m);
	        const masked = createMask({
	          overwrite: this._overwrite,
	          eager: this._eager,
	          skipInvalid: this._skipInvalid,
	          ...maskOpts
	        });
	        if (expose) this.exposeMask = masked;
	        return masked;
	      }) : [];

	      // this.currentMask = this.doDispatch(''); // probably not needed but lets see
	    }
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const details = this._applyDispatch(ch, flags);
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
	    }
	    return details;
	  }
	  _applyDispatch(appended, flags, tail) {
	    if (appended === void 0) {
	      appended = '';
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (tail === void 0) {
	      tail = '';
	    }
	    const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
	    const inputValue = this.rawInputValue;
	    const insertValue = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._rawInputValue : inputValue;
	    const tailValue = inputValue.slice(insertValue.length);
	    const prevMask = this.currentMask;
	    const details = new ChangeDetails();
	    const prevMaskState = prevMask == null ? void 0 : prevMask.state;

	    // clone flags to prevent overwriting `_beforeTailState`
	    this.currentMask = this.doDispatch(appended, {
	      ...flags
	    }, tail);

	    // restore state after dispatch
	    if (this.currentMask) {
	      if (this.currentMask !== prevMask) {
	        // if mask changed reapply input
	        this.currentMask.reset();
	        if (insertValue) {
	          this.currentMask.append(insertValue, {
	            raw: true
	          });
	          details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
	        }
	        if (tailValue) {
	          details.tailShift += this.currentMask.append(tailValue, {
	            raw: true,
	            tail: true
	          }).tailShift;
	        }
	      } else if (prevMaskState) {
	        // Dispatch can do something bad with state, so
	        // restore prev mask state
	        this.currentMask.state = prevMaskState;
	      }
	    }
	    return details;
	  }
	  _appendPlaceholder() {
	    const details = this._applyDispatch();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendPlaceholder());
	    }
	    return details;
	  }
	  _appendEager() {
	    const details = this._applyDispatch();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendEager());
	    }
	    return details;
	  }
	  appendTail(tail) {
	    const details = new ChangeDetails();
	    if (tail) details.aggregate(this._applyDispatch('', {}, tail));
	    return details.aggregate(this.currentMask ? this.currentMask.appendTail(tail) : super.appendTail(tail));
	  }
	  currentMaskFlags(flags) {
	    var _flags$_beforeTailSta, _flags$_beforeTailSta2;
	    return {
	      ...flags,
	      _beforeTailState: ((_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.currentMaskRef) === this.currentMask && ((_flags$_beforeTailSta2 = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta2.currentMask) || flags._beforeTailState
	    };
	  }
	  doDispatch(appended, flags, tail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (tail === void 0) {
	      tail = '';
	    }
	    return this.dispatch(appended, this, flags, tail);
	  }
	  doValidate(flags) {
	    return super.doValidate(flags) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags)));
	  }
	  doPrepare(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let [s, details] = super.doPrepare(str, flags);
	    if (this.currentMask) {
	      let currentDetails;
	      [s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags));
	      details = details.aggregate(currentDetails);
	    }
	    return [s, details];
	  }
	  doPrepareChar(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let [s, details] = super.doPrepareChar(str, flags);
	    if (this.currentMask) {
	      let currentDetails;
	      [s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags));
	      details = details.aggregate(currentDetails);
	    }
	    return [s, details];
	  }
	  reset() {
	    var _this$currentMask;
	    (_this$currentMask = this.currentMask) == null || _this$currentMask.reset();
	    this.compiledMasks.forEach(m => m.reset());
	  }
	  get value() {
	    return this.exposeMask ? this.exposeMask.value : this.currentMask ? this.currentMask.value : '';
	  }
	  set value(value) {
	    if (this.exposeMask) {
	      this.exposeMask.value = value;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	    } else super.value = value;
	  }
	  get unmaskedValue() {
	    return this.exposeMask ? this.exposeMask.unmaskedValue : this.currentMask ? this.currentMask.unmaskedValue : '';
	  }
	  set unmaskedValue(unmaskedValue) {
	    if (this.exposeMask) {
	      this.exposeMask.unmaskedValue = unmaskedValue;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	    } else super.unmaskedValue = unmaskedValue;
	  }
	  get typedValue() {
	    return this.exposeMask ? this.exposeMask.typedValue : this.currentMask ? this.currentMask.typedValue : '';
	  }
	  set typedValue(typedValue) {
	    if (this.exposeMask) {
	      this.exposeMask.typedValue = typedValue;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	      return;
	    }
	    let unmaskedValue = String(typedValue);

	    // double check it
	    if (this.currentMask) {
	      this.currentMask.typedValue = typedValue;
	      unmaskedValue = this.currentMask.unmaskedValue;
	    }
	    this.unmaskedValue = unmaskedValue;
	  }
	  get displayValue() {
	    return this.currentMask ? this.currentMask.displayValue : '';
	  }
	  get isComplete() {
	    var _this$currentMask2;
	    return Boolean((_this$currentMask2 = this.currentMask) == null ? void 0 : _this$currentMask2.isComplete);
	  }
	  get isFilled() {
	    var _this$currentMask3;
	    return Boolean((_this$currentMask3 = this.currentMask) == null ? void 0 : _this$currentMask3.isFilled);
	  }
	  remove(fromPos, toPos) {
	    const details = new ChangeDetails();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask.remove(fromPos, toPos))
	      // update with dispatch
	      .aggregate(this._applyDispatch());
	    }
	    return details;
	  }
	  get state() {
	    var _this$currentMask4;
	    return {
	      ...super.state,
	      _rawInputValue: this.rawInputValue,
	      compiledMasks: this.compiledMasks.map(m => m.state),
	      currentMaskRef: this.currentMask,
	      currentMask: (_this$currentMask4 = this.currentMask) == null ? void 0 : _this$currentMask4.state
	    };
	  }
	  set state(state) {
	    const {
	      compiledMasks,
	      currentMaskRef,
	      currentMask,
	      ...maskedState
	    } = state;
	    if (compiledMasks) this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
	    if (currentMaskRef != null) {
	      this.currentMask = currentMaskRef;
	      this.currentMask.state = currentMask;
	    }
	    super.state = maskedState;
	  }
	  extractInput(fromPos, toPos, flags) {
	    return this.currentMask ? this.currentMask.extractInput(fromPos, toPos, flags) : '';
	  }
	  extractTail(fromPos, toPos) {
	    return this.currentMask ? this.currentMask.extractTail(fromPos, toPos) : super.extractTail(fromPos, toPos);
	  }
	  doCommit() {
	    if (this.currentMask) this.currentMask.doCommit();
	    super.doCommit();
	  }
	  nearestInputPos(cursorPos, direction) {
	    return this.currentMask ? this.currentMask.nearestInputPos(cursorPos, direction) : super.nearestInputPos(cursorPos, direction);
	  }
	  get overwrite() {
	    return this.currentMask ? this.currentMask.overwrite : this._overwrite;
	  }
	  set overwrite(overwrite) {
	    this._overwrite = overwrite;
	  }
	  get eager() {
	    return this.currentMask ? this.currentMask.eager : this._eager;
	  }
	  set eager(eager) {
	    this._eager = eager;
	  }
	  get skipInvalid() {
	    return this.currentMask ? this.currentMask.skipInvalid : this._skipInvalid;
	  }
	  set skipInvalid(skipInvalid) {
	    this._skipInvalid = skipInvalid;
	  }
	  get autofix() {
	    return this.currentMask ? this.currentMask.autofix : this._autofix;
	  }
	  set autofix(autofix) {
	    this._autofix = autofix;
	  }
	  maskEquals(mask) {
	    return Array.isArray(mask) ? this.compiledMasks.every((m, mi) => {
	      if (!mask[mi]) return;
	      const {
	        mask: oldMask,
	        ...restOpts
	      } = mask[mi];
	      return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
	    }) : super.maskEquals(mask);
	  }
	  typedValueEquals(value) {
	    var _this$currentMask5;
	    return Boolean((_this$currentMask5 = this.currentMask) == null ? void 0 : _this$currentMask5.typedValueEquals(value));
	  }
	}
	/** Currently chosen mask */
	/** Currently chosen mask */
	/** Compliled {@link Masked} options */
	/** Chooses {@link Masked} depending on input value */
	MaskedDynamic.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  dispatch: (appended, masked, flags, tail) => {
	    if (!masked.compiledMasks.length) return;
	    const inputValue = masked.rawInputValue;

	    // simulate input
	    const inputs = masked.compiledMasks.map((m, index) => {
	      const isCurrent = masked.currentMask === m;
	      const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);
	      if (m.rawInputValue !== inputValue) {
	        m.reset();
	        m.append(inputValue, {
	          raw: true
	        });
	      } else if (!isCurrent) {
	        m.remove(startInputPos);
	      }
	      m.append(appended, masked.currentMaskFlags(flags));
	      m.appendTail(tail);
	      return {
	        index,
	        weight: m.rawInputValue.length,
	        totalInputPositions: m.totalInputPositions(0, Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)))
	      };
	    });

	    // pop masks with longer values first
	    inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);
	    return masked.compiledMasks[inputs[0].index];
	  }
	};
	IMask.MaskedDynamic = MaskedDynamic;

	/** Pattern which validates enum values */
	class MaskedEnum extends MaskedPattern {
	  constructor(opts) {
	    super({
	      ...MaskedEnum.DEFAULTS,
	      ...opts
	    }); // mask will be created in _update
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      enum: enum_,
	      ...eopts
	    } = opts;
	    if (enum_) {
	      const lengths = enum_.map(e => e.length);
	      const requiredLength = Math.min(...lengths);
	      const optionalLength = Math.max(...lengths) - requiredLength;
	      eopts.mask = '*'.repeat(requiredLength);
	      if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';
	      this.enum = enum_;
	    }
	    super._update(eopts);
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
	    const matches = this.enum.filter(e => this.matchValue(e, this.unmaskedValue + ch, matchFrom));
	    if (matches.length) {
	      if (matches.length === 1) {
	        this._forEachBlocksInRange(0, this.value.length, (b, bi) => {
	          const mch = matches[0][bi];
	          if (bi >= this.value.length || mch === b.value) return;
	          b.reset();
	          b._appendChar(mch, flags);
	        });
	      }
	      const d = super._appendCharRaw(matches[0][this.value.length], flags);
	      if (matches.length === 1) {
	        matches[0].slice(this.unmaskedValue.length).split('').forEach(mch => d.aggregate(super._appendCharRaw(mch)));
	      }
	      return d;
	    }
	    return new ChangeDetails({
	      skip: !this.isComplete
	    });
	  }
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    // just drop tail
	    return new ContinuousTailDetails('', fromPos);
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    if (fromPos === toPos) return new ChangeDetails();
	    const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
	    let pos;
	    for (pos = fromPos; pos >= 0; --pos) {
	      const matches = this.enum.filter(e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom));
	      if (matches.length > 1) break;
	    }
	    const details = super.remove(pos, toPos);
	    details.tailShift += pos - fromPos;
	    return details;
	  }
	  get isComplete() {
	    return this.enum.indexOf(this.value) >= 0;
	  }
	}
	/** Match enum value */
	MaskedEnum.DEFAULTS = {
	  ...MaskedPattern.DEFAULTS,
	  matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom
	};
	IMask.MaskedEnum = MaskedEnum;

	/** Masking by custom Function */
	class MaskedFunction extends Masked {
	  /** */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update({
	      ...opts,
	      validate: opts.mask
	    });
	  }
	}
	IMask.MaskedFunction = MaskedFunction;

	var _MaskedNumber;
	/** Number mask */
	class MaskedNumber extends Masked {
	  /** Single char */

	  /** Single char */

	  /** Array of single chars */

	  /** */

	  /** */

	  /** Digits after point */

	  /** Flag to remove leading and trailing zeros in the end of editing */

	  /** Flag to pad trailing zeros after point in the end of editing */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  constructor(opts) {
	    super({
	      ...MaskedNumber.DEFAULTS,
	      ...opts
	    });
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update(opts);
	    this._updateRegExps();
	  }
	  _updateRegExps() {
	    const start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
	    const mid = '\\d*';
	    const end = (this.scale ? "(" + escapeRegExp(this.radix) + "\\d{0," + this.scale + "})?" : '') + '$';
	    this._numberRegExp = new RegExp(start + mid + end);
	    this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(escapeRegExp).join('') + "]", 'g');
	    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
	  }
	  _removeThousandsSeparators(value) {
	    return value.replace(this._thousandsSeparatorRegExp, '');
	  }
	  _insertThousandsSeparators(value) {
	    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
	    const parts = value.split(this.radix);
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
	    return parts.join(this.radix);
	  }
	  doPrepareChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(this.scale && this.mapToRadix.length && (
	    /*
	      radix should be mapped when
	      1) input is done from keyboard = flags.input && flags.raw
	      2) unmasked value is set = !flags.input && !flags.raw
	      and should not be mapped when
	      1) value is set = flags.input && !flags.raw
	      2) raw value is set = !flags.input && flags.raw
	    */
	    flags.input && flags.raw || !flags.input && !flags.raw) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch), flags);
	    if (ch && !prepCh) details.skip = true;
	    if (prepCh && !this.allowPositive && !this.value && prepCh !== '-') details.aggregate(this._appendChar('-'));
	    return [prepCh, details];
	  }
	  _separatorsCount(to, extendOnSeparators) {
	    if (extendOnSeparators === void 0) {
	      extendOnSeparators = false;
	    }
	    let count = 0;
	    for (let pos = 0; pos < to; ++pos) {
	      if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
	        ++count;
	        if (extendOnSeparators) to += this.thousandsSeparator.length;
	      }
	    }
	    return count;
	  }
	  _separatorsCountFromSlice(slice) {
	    if (slice === void 0) {
	      slice = this._value;
	    }
	    return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
	    return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
	    const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
	    this._value = this._removeThousandsSeparators(this.value);
	    const oldValue = this._value;
	    this._value += ch;
	    const num = this.number;
	    let accepted = !isNaN(num);
	    let skip = false;
	    if (accepted) {
	      let fixedNum;
	      if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
	      if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;
	      if (fixedNum != null) {
	        if (this.autofix) {
	          this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
	          skip || (skip = oldValue === this._value && !flags.tail); // if not changed on tail it's still ok to proceed
	        } else {
	          accepted = false;
	        }
	      }
	      accepted && (accepted = Boolean(this._value.match(this._numberRegExp)));
	    }
	    let appendDetails;
	    if (!accepted) {
	      this._value = oldValue;
	      appendDetails = new ChangeDetails();
	    } else {
	      appendDetails = new ChangeDetails({
	        inserted: this._value.slice(oldValue.length),
	        rawInserted: skip ? '' : ch,
	        skip
	      });
	    }
	    this._value = this._insertThousandsSeparators(this._value);
	    const beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
	    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);
	    appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
	    return appendDetails;
	  }
	  _findSeparatorAround(pos) {
	    if (this.thousandsSeparator) {
	      const searchFrom = pos - this.thousandsSeparator.length + 1;
	      const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
	      if (separatorPos <= pos) return separatorPos;
	    }
	    return -1;
	  }
	  _adjustRangeWithSeparators(from, to) {
	    const separatorAroundFromPos = this._findSeparatorAround(from);
	    if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;
	    const separatorAroundToPos = this._findSeparatorAround(to);
	    if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
	    return [from, to];
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
	    const valueBeforePos = this.value.slice(0, fromPos);
	    const valueAfterPos = this.value.slice(toPos);
	    const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
	    this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
	    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);
	    return new ChangeDetails({
	      tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
	    });
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (!this.thousandsSeparator) return cursorPos;
	    switch (direction) {
	      case DIRECTION.NONE:
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        {
	          const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
	          if (separatorAtLeftPos >= 0) {
	            const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
	            if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
	              return separatorAtLeftPos;
	            }
	          }
	          break;
	        }
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	        {
	          const separatorAtRightPos = this._findSeparatorAround(cursorPos);
	          if (separatorAtRightPos >= 0) {
	            return separatorAtRightPos + this.thousandsSeparator.length;
	          }
	        }
	    }
	    return cursorPos;
	  }
	  doCommit() {
	    if (this.value) {
	      const number = this.number;
	      let validnum = number;

	      // check bounds
	      if (this.min != null) validnum = Math.max(validnum, this.min);
	      if (this.max != null) validnum = Math.min(validnum, this.max);
	      if (validnum !== number) this.unmaskedValue = this.format(validnum, this);
	      let formatted = this.value;
	      if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
	      if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);
	      this._value = formatted;
	    }
	    super.doCommit();
	  }
	  _normalizeZeros(value) {
	    const parts = this._removeThousandsSeparators(value).split(this.radix);

	    // remove leading zeros
	    parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, (match, sign, zeros, num) => sign + num);
	    // add leading zero
	    if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';
	    if (parts.length > 1) {
	      parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros
	      if (!parts[1].length) parts.length = 1; // remove fractional
	    }
	    return this._insertThousandsSeparators(parts.join(this.radix));
	  }
	  _padFractionalZeros(value) {
	    if (!value) return value;
	    const parts = value.split(this.radix);
	    if (parts.length < 2) parts.push('');
	    parts[1] = parts[1].padEnd(this.scale, '0');
	    return parts.join(this.radix);
	  }
	  doSkipInvalid(ch, flags, checkTail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (ch === this.radix || ch === MaskedNumber.UNMASKED_RADIX || this.mapToRadix.includes(ch));
	    return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
	  }
	  get unmaskedValue() {
	    return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, MaskedNumber.UNMASKED_RADIX);
	  }
	  set unmaskedValue(unmaskedValue) {
	    super.unmaskedValue = unmaskedValue;
	  }
	  get typedValue() {
	    return this.parse(this.unmaskedValue, this);
	  }
	  set typedValue(n) {
	    this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
	  }

	  /** Parsed Number */
	  get number() {
	    return this.typedValue;
	  }
	  set number(number) {
	    this.typedValue = number;
	  }
	  get allowNegative() {
	    return this.min != null && this.min < 0 || this.max != null && this.max < 0;
	  }
	  get allowPositive() {
	    return this.min != null && this.min > 0 || this.max != null && this.max > 0;
	  }
	  typedValueEquals(value) {
	    // handle  0 -> '' case (typed = 0 even if value = '')
	    // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
	    return (super.typedValueEquals(value) || MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)) && !(value === 0 && this.value === '');
	  }
	}
	_MaskedNumber = MaskedNumber;
	MaskedNumber.UNMASKED_RADIX = '.';
	MaskedNumber.EMPTY_VALUES = [...Masked.EMPTY_VALUES, 0];
	MaskedNumber.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  mask: Number,
	  radix: ',',
	  thousandsSeparator: '',
	  mapToRadix: [_MaskedNumber.UNMASKED_RADIX],
	  min: Number.MIN_SAFE_INTEGER,
	  max: Number.MAX_SAFE_INTEGER,
	  scale: 2,
	  normalizeZeros: true,
	  padFractionalZeros: false,
	  parse: Number,
	  format: n => n.toLocaleString('en-US', {
	    useGrouping: false,
	    maximumFractionDigits: 20
	  })
	};
	IMask.MaskedNumber = MaskedNumber;

	/** Mask pipe source and destination types */
	const PIPE_TYPE = {
	  MASKED: 'value',
	  UNMASKED: 'unmaskedValue',
	  TYPED: 'typedValue'
	};
	/** Creates new pipe function depending on mask type, source and destination options */
	function createPipe(arg, from, to) {
	  if (from === void 0) {
	    from = PIPE_TYPE.MASKED;
	  }
	  if (to === void 0) {
	    to = PIPE_TYPE.MASKED;
	  }
	  const masked = createMask(arg);
	  return value => masked.runIsolated(m => {
	    m[from] = value;
	    return m[to];
	  });
	}

	/** Pipes value through mask depending on mask type, source and destination options */
	function pipe(value, mask, from, to) {
	  return createPipe(mask, from, to)(value);
	}
	IMask.PIPE_TYPE = PIPE_TYPE;
	IMask.createPipe = createPipe;
	IMask.pipe = pipe;

	/** Pattern mask */
	class RepeatBlock extends MaskedPattern {
	  get repeatFrom() {
	    var _ref;
	    return (_ref = Array.isArray(this.repeat) ? this.repeat[0] : this.repeat === Infinity ? 0 : this.repeat) != null ? _ref : 0;
	  }
	  get repeatTo() {
	    var _ref2;
	    return (_ref2 = Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) != null ? _ref2 : Infinity;
	  }
	  constructor(opts) {
	    super(opts);
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    var _ref3, _ref4, _this$_blocks;
	    const {
	      repeat,
	      ...blockOpts
	    } = normalizeOpts(opts); // TODO type
	    this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
	    const block = createMask(this._blockOpts);
	    this.repeat = (_ref3 = (_ref4 = repeat != null ? repeat : block.repeat) != null ? _ref4 : this.repeat) != null ? _ref3 : Infinity; // TODO type

	    super._update({
	      mask: 'm'.repeat(Math.max(this.repeatTo === Infinity && ((_this$_blocks = this._blocks) == null ? void 0 : _this$_blocks.length) || 0, this.repeatFrom)),
	      blocks: {
	        m: block
	      },
	      eager: block.eager,
	      overwrite: block.overwrite,
	      skipInvalid: block.skipInvalid,
	      lazy: block.lazy,
	      placeholderChar: block.placeholderChar,
	      displayChar: block.displayChar
	    });
	  }
	  _allocateBlock(bi) {
	    if (bi < this._blocks.length) return this._blocks[bi];
	    if (this.repeatTo === Infinity || this._blocks.length < this.repeatTo) {
	      this._blocks.push(createMask(this._blockOpts));
	      this.mask += 'm';
	      return this._blocks[this._blocks.length - 1];
	    }
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const details = new ChangeDetails();
	    for (let bi = (_this$_mapPosToBlock$ = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index) != null ? _this$_mapPosToBlock$ : Math.max(this._blocks.length - 1, 0), block, allocated;
	    // try to get a block or
	    // try to allocate a new block if not allocated already
	    block = (_this$_blocks$bi = this._blocks[bi]) != null ? _this$_blocks$bi : allocated = !allocated && this._allocateBlock(bi); ++bi) {
	      var _this$_mapPosToBlock$, _this$_mapPosToBlock, _this$_blocks$bi, _flags$_beforeTailSta;
	      const blockDetails = block._appendChar(ch, {
	        ...flags,
	        _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
	      });
	      if (blockDetails.skip && allocated) {
	        // remove the last allocated block and break
	        this._blocks.pop();
	        this.mask = this.mask.slice(1);
	        break;
	      }
	      details.aggregate(blockDetails);
	      if (blockDetails.consumed) break; // go next char
	    }
	    return details;
	  }
	  _trimEmptyTail(fromPos, toPos) {
	    var _this$_mapPosToBlock2, _this$_mapPosToBlock3;
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    const firstBlockIndex = Math.max(((_this$_mapPosToBlock2 = this._mapPosToBlock(fromPos)) == null ? void 0 : _this$_mapPosToBlock2.index) || 0, this.repeatFrom, 0);
	    let lastBlockIndex;
	    if (toPos != null) lastBlockIndex = (_this$_mapPosToBlock3 = this._mapPosToBlock(toPos)) == null ? void 0 : _this$_mapPosToBlock3.index;
	    if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;
	    let removeCount = 0;
	    for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, ++removeCount) {
	      if (this._blocks[blockIndex].unmaskedValue) break;
	    }
	    if (removeCount) {
	      this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
	      this.mask = this.mask.slice(removeCount);
	    }
	  }
	  reset() {
	    super.reset();
	    this._trimEmptyTail();
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const removeDetails = super.remove(fromPos, toPos);
	    this._trimEmptyTail(fromPos, toPos);
	    return removeDetails;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos == null && this.repeatTo === Infinity) return Infinity;
	    return super.totalInputPositions(fromPos, toPos);
	  }
	  get state() {
	    return super.state;
	  }
	  set state(state) {
	    this._blocks.length = state._blocks.length;
	    this.mask = this.mask.slice(0, this._blocks.length);
	    super.state = state;
	  }
	}
	IMask.RepeatBlock = RepeatBlock;

	try {
	  globalThis.IMask = IMask;
	} catch {}

	const phoneFields = document.querySelectorAll('[data-type="phone"]');
	const maskOptions = {
	  mask: '+{7}(000) 000 - 00 - 00'
	};
	phoneFields.forEach(field => {
	  IMask(field, maskOptions);
	});

}));
//# sourceMappingURL=bundle.js.map

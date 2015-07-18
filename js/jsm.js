/*
* Copyright (c) 2010 big G games.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

(function(win)
{
	var jsm = 
	{
		version : '0.2',
		modules : {},
		device : {},
		path : win.jsmPath || 'js/',
		nocache : document.location.href.match(/(\?|\&)nocache/) ? (new Date).getTime() : '',

		_current : null,
		_moduleQueue : [],
		_waitForLoad : 0,
		_loadComplete : false,
		_domReady : false,

		_ignoredObjects : [],

		ignoreObject : function(object)
		{
			if ( this._ignoredObjects.indexOf(object) === -1 )
				this._ignoredObjects.push(object);
		},

		_checkIgnoredObjects : function(object)
		{
			for ( var i = 0; i < this._ignoredObjects.length; i++ )
				if ( object instanceof this._ignoredObjects[i++] )
					return true;

			return false
		},

		copy : function(object)
		{
			if ( 
				!object || 
				typeof object !== 'object' ||
				object instanceof HTMLElement ||
				object instanceof jsm.Class ||
				this._checkIgnoredObjects(object)
			)
				return object;

			else if ( object instanceof Array )
			{
				var objects = [], i = 0, obj;

				for ( ; obj = object[i++]; )
					objects.push( jsm.copy(obj) );
			}
			else
			{
				var objects = {}, obj;

				for ( obj in object )
					objects[obj] = jsm.copy(object[obj]);
			}

			return objects
		},

		merge : function(object1, object2)
		{
			var key, ext;

			for ( key in object2 )
			{
				ext = object2[key];

				if (
					typeof ext !== 'object' ||
					ext instanceof HTMLElement ||
					ext instanceof jsm.Class ||
					this._checkIgnoredObjects(ext) ||
					ext === null
				)
					object1[key] = ext;

				else
				{
					if ( !object1[key] || typeof object1[key] !== 'object' )
						object1[key] = ext instanceof Array ? [] : {};

					jsm.merge(object1[key], ext);
				}
			}

			return object1
		},

		ksort : function(object)
		{
			if ( !object || typeof object !== 'object' )
				return [];

			var keys = [],
				values = [],
				key,
				i = 0;

			for ( key in object )
				keys.push(key);

			keys.sort();

			for ( ; key = keys[i++]; )
				values.push(object[key]);

			return values
		},

		setVendorAttribute : function(el, attr, val)
		{
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			el[attr] = el['ms' + uc] = el['moz' + uc] = el['webkit' + uc] = el['o' + uc] = val
		},

		getVendorAttribute : function(el, attr) 
		{
			var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
			return el[attr] || el['ms' + uc] || el['moz' + uc] || el['webkit' + uc] || el['o' + uc]
		},

		normalizeVendorAttribute : function(el, attr) 
		{
			var preVal = jsm.getVendorAttribute(el, attr);
			if ( !el[attr] && preVal )
				el[attr] = preVal;
		},

		goFullscreen : function(element)
		{
			element = element || document.documentElement;
			
			if ( element.requestFullScreen )
				element.requestFullScreen();
			else if ( element.webkitRequestFullScreen )
				element.webkitRequestFullScreen();
			else if ( element.mozRequestFullScreen )
				element.mozRequestFullScreen();
		},

		module : function(name) 
		{
			if ( this._current )
				throw 'Module "' + this._current.name + '" defines nothing';

			if ( this.modules[name] && this.modules[name].body )
				throw 'Module "' + name + '" is already defined';

			this._current = 
			{
				name : name,
				requires : [],
				loaded : false,
				body : null
			};

			this.modules[name] = this._current;
			this._moduleQueue.push(this._current);

			return this
		},
		
		requires : function() 
		{
			this._current.requires = Array.prototype.slice.call(arguments);
			return this
		},		
		
		defines : function(body) 
		{
			this._current.body = body || function() {};
			this._current = null;

			if ( this._loadComplete )
				this._loadModules();
		},

		_loadScript : function(name, requiredFrom)
		{
			this._waitForLoad++;
			this.modules[name] =
			{
				name : name,
				requires : [],
				loaded : false,
				body : null
			};

			var path = this.path + name.replace(/\./g, '/') + '.js' + this.nocache;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = path;
			script.onload = function()
			{
				jsm._waitForLoad--;
				jsm._loadModules();
			};
			script.onerror = function()
			{
				throw 'Failed to load module "' + name + '" at path "' + path + '" required from "' + requiredFrom + '"'
			};

			// add it to the head
			document.getElementsByTagName('head')[0].appendChild(script)
		},

		_loadModules : function()
		{
			var modulesLoaded = false,
				dependenciesLoaded,
				module,
				name,
				i = 0,
				j;

			for ( ; i < this._moduleQueue.length; i++ )
			{
				module = this._moduleQueue[i];
				dependenciesLoaded = true;

				for ( j = 0; j < module.requires.length; j++ )
				{
					name = module.requires[j];

					if ( !this.modules[name] )
					{
						dependenciesLoaded = false;
						this._loadScript(name, module.name);
					}
					else if ( !this.modules[name].loaded )
						dependenciesLoaded = false;
				}

				if ( dependenciesLoaded && module.body )
				{
					this._moduleQueue.splice(i, 1);
					module.loaded = true;
					module.body();
					modulesLoaded = true;
					i--;
				}
			}

			// lets continue checking
			if ( modulesLoaded && this._moduleQueue.length )
				this._loadModules();

			// something went wrong
			else if ( !this._waitForLoad && this._moduleQueue.length )
			{
				var unresolved = [],
					unloaded = [],
					requires,
					module,
					i = 0,
					j;

				for ( ; i < this._moduleQueue.length; i++ )
				{
					unloaded.length = 0;
					requires = this._moduleQueue[i].requires;

					for ( j = 0; j < requires.length; j++ )
					{
						module = this.modules[ requires[j] ];
						if ( !module || !module.loaded )
							unloaded.push( requires[j] );
					}

					unresolved.push( this._moduleQueue[i].name + ' (requires ' + unloaded.join(', ') + ')' );
				}

				throw 'Unresolved modules:\n' + unresolved.join('\n');
			}

			// done
			else
				this._loadComplete = true;
		},

		_domReadyComplete : function()
		{
			if ( !this._domReady )
			{
				if ( !document.body )
					return setTimeout(this._domReadyComplete.bind(this), 42);

				this._domReady = true;
				this._loadModules();
			}
		},

		// extend some native stuff
		_bootNative : function()
		{
			Math.rand = function(min, max)
			{
				var n = Math.random();

				// default
				if ( !min && !max )
					return n;

				// return an int
				else if ( min.isInt() && max.isInt() )
					return Math.floor(n * (max - min + 1)) + min;

				// return decimal
				else
					return (n * (max - min)) + min;
			}

			Math.lerp = function(current, target, time) { return current + time * (target - current) }

			Math.distance = function(x1, y1, x2, y2, sqrt)
			{
				var dx = x2 - x1, dy = y2 - y1;
				return !!sqrt ? Math.sqrt(dx * dx + dy * dy) : dx * dx + dy * dy
			}

			Number.prototype.lerp = function(target, time) { return Math.lerp(this, target, time) }

			Number.prototype.map = function(istart, istop, ostart, ostop) { return ostart + (ostop - ostart) * ((this - istart) / (istop - istart)) }

			Number.prototype.commaFormat = function() { return (this + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') }

			Number.prototype.limit = function(min, max){ return Math.min(max, Math.max(min, this)) }

			Number.prototype.round = function(precision) 
			{
				precision = Math.pow(10, precision || 0);
				return Math.round(this * precision) / precision
			}

			Number.prototype.isInt = function() { return this % 1 == 0 }

			Number.prototype.toInt = function() { return (this | 0) }

			Number.prototype.toRad = function() { return (this / 180) * Math.PI }

			Number.prototype.toDeg = function() { return (this * 180) / Math.PI }

			String.prototype.ucwords = function() 
			{
				return this.toLowerCase().replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, function($1) { return $1.toUpperCase() })
			}

			Object.defineProperty(Array.prototype, 'erase', 
			{ 
				value : function(item)
				{
					var index = this.indexOf(item);
					if ( index > -1 ) 
						this.splice(index, 1);

					return this
				}
			})

			Object.defineProperty(Array.prototype, 'random',
			{
				value : function()
				{
					return this[Math.rand(0, this.length - 1)]
				}
			})

			Object.defineProperty(Array.prototype, 'shuffle',
			{
				value : function()
				{
					for ( var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x ) {}
					return this
				}
			})

			Function.prototype.bind = Function.prototype.bind || function(object)
			{
				var ftn = this;
				return function() { return ftn.apply(object, arguments) }
			}
		},

		_bootDevice : function()
		{
			var ua = navigator.userAgent;
			var dev = {};

			dev.pixelRatio = win.devicePixelRatio || 1;

			// ios
			dev.iPod = /ipod/i.test(ua);
			dev.iPhone = /iphone/i.test(ua);
			dev.iPad = /ipad/i.test(ua);
			dev.iOS = dev.iPod || dev.iPhone || dev.iPad;
			dev.iOSVersion = dev.iOS ? parseFloat(((ua.match(/os (\d+_\d+)?/i) || ['', ''])[1] + '').replace('_', '.')) : -1;

			// android/silk
			dev.kindle = /silk/i.test(ua);
			dev.android = /android/i.test(ua);
			dev.androidPhone = /(?=.*\bandroid\b)(?=.*\bmobile\b)/i.test(ua);
			dev.androidTablet = (!dev.androidPhone && dev.android) || dev.kindle;
			dev.android = dev.androidPhone || dev.androidTablet;
			dev.androidVersion = ua.match(/android\s([0-9\.]*)/i);
			dev.androidVersion = dev.androidVersion ? dev.androidVersion[1] : -1;

			// win
			dev.winPhone = /(iemobile|windows phone)/i.test(ua);
			dev.winTablet = /(?=.*\bwindows\b)(?=.*\\btouch\b)/i.test(ua);

			// browser
			dev.chrome = /chrome/i.test(ua);
			dev.safari = /safari/i.test(ua);
			dev.ie = /msie 9/i.test(ua) || !!ua.match(/trident.*rv:/i); // lets not bother looking for version. if this is true, thats bad news...
			dev.firefox = /firefox/i.test(ua);

			// misc
			dev.mobile = dev.iOS || dev.android || dev.winPhone || dev.winTablet || /mobile/i.test(ua);
			dev.tablet = dev.iPad || dev.androidTablet || dev.winTablet;
			dev.opera = /opera/i.test(ua) || /opr/i.test(ua);
			dev.crosswalk = /crosswalk/i.test(ua);
			dev.cocoonJS = !!navigator.isCocoonJS;
			dev.ejecta = /ejecta/i.test(ua);
			dev.facebook = /fb/i.test(ua);
			dev.wiiu = /nintendo wiiu/i.test(ua);

			dev.touchDevice = ('ontouchstart' in win) || win.navigator.msMaxTouchPoints;

			// inject viewport meta
			if ( dev.mobile )
			{
				var metaTags = document.getElementsByTagName('meta');
				for ( var i = 0, viewportFound = false, metaTag; metaTag = metaTags[i++]; )
					if ( metaTag.name == 'viewport' )
						viewportFound = true;

				if ( !viewportFound )
				{
					var viewport = document.createElement('meta');
					viewport.name = 'viewport';
					viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

					if ( dev.iOSVersion == 7.1 ) 
						viewport.content += ', minimal-ui';

					document.getElementsByTagName('head')[0].appendChild(viewport);
				}					
			}

			// set property
			this.device = dev;
		},

		_boot : function()
		{
			// additional boot stuff
			this._bootNative();
			this._bootDevice();

			// wait for the dom to be complete
			if ( document.readyState === 'complete' )
				this._domReadyComplete();
			else 
			{
				document.addEventListener('DOMContentLoaded', this._domReadyComplete.bind(this), false);
				window.addEventListener('load', this._domReadyComplete.bind(this), false);
			}
		}
	};

	// http://ejohn.org/blog/simple-javascript-inheritance/

	var initializing = false, 
		ftnTest = /xyz/.test(function(){ xyz }) ? /\bparent\b/ : /.*/,
		inject = function(prop)
		{
			var proto = this.prototype,
				parent = {},
				name,
				tmp,
				ret;

			for ( name in prop )
			{
				if ( 
					typeof prop[name] === 'function' && 
					typeof proto[name] === 'function' &&
					ftnTest.test(prop[name])
				)
				{
					parent[name] = proto[name];
					proto[name] = (function(nm, fn)
					{
						return function()
						{
							tmp = this.parent;
							this.parent = parent[nm];
							ret = fn.apply(this, arguments);
							this.parent = tmp;

							return ret
						}
					})(name, prop[name]);
				}
				else
					proto[name] = prop[name];
			}
		};

	jsm.Class = function() {};
	jsm.Class.extend = function(prop)
	{
		var parent = this.prototype,
			prototype,
			name,
			tmp,
			ret;

		initializing = true;
		prototype = new this;
		initializing = false;

		for ( name in prop )
		{
			if (
				typeof prop[name] === 'function' &&
				typeof parent[name] === 'function' &&
				ftnTest.test(prop[name])
			)
				prototype[name] = (function(nm, fn)
				{
					return function()
					{
						tmp = this.parent;
						this.parent = parent[nm];
						ret = fn.apply(this, arguments);
						this.parent = tmp;

						return ret
					}
				})(name, prop[name]);

			else
				prototype[name] = prop[name];
		}

		function Class()
		{
			if ( !initializing )
			{
				if ( this.staticInit )
				{
					var obj = this.staticInit.apply(this, arguments);
					if ( obj )
						return obj;
				}

				for ( var p in this )
					if ( typeof this[p] === 'object' )
						this[p] = jsm.copy(this[p]);

				if ( this.init )
					this.init.apply(this, arguments);
			}

			return this
		}

		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = jsm.Class.extend;
		Class.inject = inject;

		return Class
	};

	// set jsm as a global
	if ( !window.jsm )
		window.jsm = jsm;

	// boot it up!
	jsm._boot();

})(window);
jsm.module(
	'playhouse.system'
)
.requires(
	'lib.create',

	'playhouse.input',
	'playhouse.loader',
	'playhouse.timer',
	'playhouse.scene',
	'playhouse.session',
	'playhouse.spritesheet'
)
.defines(function()
{
	ph.System = jsm.Class.extend(
	{
		scale : 1,
		delta : 0,

		width : 240,
		widthMin : 240,
		widthMax : 284,
		height : 160,
		heightMin : 160,
		heightMax : 192,

		delegate : null,
		stage : null,

		isWrongOrientation : false,
		canvas : null,
		wrapper : null,
		isFocused : true,

		staticInit : function()
		{
			return ph.system || null
		},

		init : function(gameObj, gameDim, scale)
		{
			if ( !window.createjs )
				throw 'Where is CreateJS? Go get it...';

			ph.system = this;

			this.scale = scale || this.scale;
			this.widthMin = gameDim && gameDim.widthMin || this.widthMin;
			this.widthMax = gameDim && gameDim.widthMax || this.widthMax;
			this.heightMin = gameDim && gameDim.heightMin || this.heightMin;
			this.heightMax = gameDim && gameDim.heightMax || this.heightMax;

			this.setupElements();
			this.setupStage();

			this.onPageShowBound = this.onPageShow.bind(this);
			this.onPageHideBound = this.onPageHide.bind(this);
			window.addEventListener('pageshow', this.onPageShowBound, false);
			window.addEventListener('pagehide', this.onPageHideBound, false);
			window.addEventListener('focus', this.onPageShowBound, false);
			window.addEventListener('blur', this.onPageHideBound, false);

			this.onWindowResizeBounds = this.onWindowResize.bind(this);
			window.addEventListener('load', this.onWindowResizeBounds, false);
			window.addEventListener('resize', this.onWindowResizeBounds, false);

			// keep this going, because sometimes the orientation event isn't reliable
			setInterval(this.onWindowResizeBounds, 500);

			// we don't like this
			document.ontouchmove = function(e) { e.preventDefault() };

			// start the game already!
			this.delegate = new gameObj;
		},

		run : function(e)
		{
			if ( !this.isFocused )
				e.delta = 0;

			ph.Timer.step();

			this.delta = e.delta * 0.001;

			this.delegate && this.delegate.update(e);

			this.stage && this.stage.update(e);

			ph.input.clearPressed();
		},

		getUrlVar : function(name)
		{
			var vars = {};
			window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { vars[key] = value });
			return vars[name] || null
		},

		setupElements : function()
		{
			if ( jsm.device.ejecta )
				this.canvas = document.getElementById('canvas');

			else
			{
				if ( jsm.device.cocoonJS )
				{
					this.canvas = document.createElement('canvas');
					document.body.appendChild(this.canvas);
				}
				else
				{
					this.wrapper = document.getElementById('wrapper') || document.createElement('div');
					this.wrapper.id = 'wrapper';
					document.body.appendChild(this.wrapper);

					this.canvas = this.wrapper.getElementsByTagName('canvas')[0] || document.createElement('canvas');
					this.wrapper.appendChild(this.canvas);
				}
			}
		},

		setupStage : function()
		{
			if ( jsm.device.cocoonJS )
				this.canvas.style.cssText = 'idtkscale:ScaleAspectFill';

			this.stage = new createjs.Stage(this.canvas);
			this.stage.preventSelection = false;

			if ( jsm.device.mobile && createjs.Touch.isSupported() )
			{
				createjs.Touch.enable(this.stage);
				this.stage.enableDOMEvents(false);
				this.stage.snapToPixelEnabled = true;
			}
			else
				this.stage.enableMouseOver(30);

			// start the input
			new ph.Input(this.stage);
			ph.input.bind(ph.KEY.MOUSE1);

			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			createjs.Ticker.on('tick', this.run, this);
		},

		resize : function(width, height, scale)
		{
			this.width = width * this.scale;
			this.height = height * this.scale;

			var canvases = this.wrapper ? this.wrapper.getElementsByTagName('canvas') : [this.canvas];

			for ( var i = 0, canvas; canvas = canvases[i++]; )
			{
				canvas.width = this.width;
				canvas.height = this.height;
			}
		},

		_lastSize : 0,
		onWindowResize : function()
		{
			setTimeout(function() { window.scrollTo && window.scrollTo(0, 0) }, 1);

			if ( this._lastSize === window.innerWidth + window.innerHeight )
				return;

			var winWidth = window.innerWidth,
				winHeight = window.innerHeight,
				widthScale = winWidth / this.widthMin,
				heightScale = winHeight / this.heightMin,
				canWidth = this.widthMin,
				canHeight = this.heightMin,
				scale,
				element = this.wrapper || this.canvas;

			if ( widthScale > heightScale ) 
			{
				if ( winWidth > this.widthMax * heightScale )
					canWidth = this.widthMax;
				else if ( winWidth < this.widthMin * heightScale )
					canWidth = this.widthMin;
				else
					canWidth = winWidth / heightScale;
			}
			else
			{
				if ( winHeight > this.heightMax * widthScale )
					canHeight = this.heightMax;
				else if ( winHeight < this.heightMin * widthScale )
					canHeight = this.heightMin;
				else
					canHeight = winHeight / widthScale;
			}

			canWidth = ~~canWidth;
			canHeight = ~~canHeight;

			// resize the canvas(es)
			this.resize(canWidth, canHeight, this.scale);

			// is it?
			this.isWrongOrientation = winWidth / winHeight < canWidth / canHeight;

			// get the scale
			scale = widthScale > heightScale ? winHeight / canHeight : winWidth / canWidth;

			// set some styles so the wrapper/canvas is in the middle
			element.style.maxWidth = element.style.maxHeight = element.style.margin = '';
			element.style.width = ~~(canWidth * scale) + 'px';
			element.style.height = ~~(canHeight * scale) + 'px';
			element.style.marginTop = ~~((winHeight - (canHeight * scale)) * 0.5) + 'px';

			setTimeout(function() { window.scrollTo && window.scrollTo(0, 0) }, 1);
			this._lastSize = winWidth + winHeight;
		},

		onPageShow : function() { this.isFocused = true },
		onPageHide : function() { this.isFocused = false },

		imageSmoothingEnabled : function(flag)
		{
			jsm.setVendorAttribute(this.canvas.getContext('2d'), 'imageSmoothingEnabled', flag);

			if ( flag )
			{
				this.canvas.style.imageRendering = '';
				this.canvas.style.msInterpolationMode = '';
				this.stage.snapToPixelEnabled = false;
			}
			else
			{
				this.canvas.style.imageRendering = '-moz-crisp-edges';
				this.canvas.style.imageRendering = '-o-crisp-edges';
				this.canvas.style.imageRendering = '-webkit-optimize-contrast';
				this.canvas.style.imageRendering = 'crisp-edges';
				this.canvas.style.msInterpolationMode = 'nearest-neighbor';
				this.stage.snapToPixelEnabled = true;
			}
		}
	})
});
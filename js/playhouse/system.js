ph.module(
	'playhouse.system'
)
.requires(
	'playhouse.input',
	'playhouse.loader',
	'playhouse.timer',
	'playhouse.scene',
	'playhouse.session',
	'playhouse.spritesheet',
	'playhouse.container',
	'playhouse.music'
)
.defines(function()
{
	ph.System = ph.Class.extend(
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
		stages : [],

		isWrongOrientation : false,
		canvas : null,
		wrapper : null,
		isFocused : true,

		staticInit : function()
		{
			return ph.system || null
		},

		init : function(gameClass, gameDim, scale)
		{
			if ( !window.createjs )
				throw 'Where is CreateJS? Go get it...';

			ph.system = this;

			this.scale = scale || this.scale;
			this.widthMin = gameDim && gameDim.widthMin || this.widthMin;
			this.widthMax = gameDim && gameDim.widthMax || this.widthMax;
			this.heightMin = gameDim && gameDim.heightMin || this.heightMin;
			this.heightMax = gameDim && gameDim.heightMax || this.heightMax;

			var resizeWindowBound = this.onWindowResize.bind(this);
			var pageShowBound = this.onPageShow.bind(this);
			var pageHideBound = this.onPageHide.bind(this);
			var changeBound = this.onChange.bind(this);

			// some window events
			window.addEventListener('load', resizeWindowBound, false);
			window.addEventListener('resize', resizeWindowBound, false);
			window.addEventListener('orientationchange', resizeWindowBound, false);
			window.addEventListener('pageshow', pageShowBound, false);
			window.addEventListener('pagehide', pageHideBound, false);
			window.addEventListener('focus', pageShowBound, false);
			window.addEventListener('blur', pageHideBound, false);

			var hidden = 'hidden';
			if ( hidden in document )
				document.addEventListener('visibilitychange', changeBound);
			else if ( (hidden = 'mozHidden') in document )
				document.addEventListener('mozvisibilitychange', changeBound);
			else if ( (hidden = 'webkitHidden') in document )
				document.addEventListener('webkitvisibilitychange', changeBound);
			else if ( (hidden = 'msHidden') in document )
				document.addEventListener('msvisibilitychange', changeBound);

			this.hiddenEventType = hidden;

			// we don't like this
			document.ontouchmove = function(e) { e.preventDefault() };

			// sets the wrapper and/or canvas depending on what we are doing
			this.setupElements();

			// sets up the createjs stage and init input
			this.addStage();

			// call this now
			this.onWindowResize();
			setInterval(resizeWindowBound, 500);

			// start the ticker!
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
			createjs.Ticker.on('tick', this.run, this);

			// start the game already!
			this.delegate = new gameClass();
		},

		run : function(e)
		{
			if ( this.isFocused === -1 )
				return;

			if ( this.isFocused > 0 )
			{
				this.isFocused--;
				return;
			}

			ph.Timer.step();

			// update the delta
			this.delta = e.delta * 0.001;

			// update game
			this.updateGame(e);

			// update the stage
			this.updateStage(e);

			// input stuff
			ph.input.clearPressed();

			// wrong orientation?
			if ( this.isWrongOrientation )
				this.delegate.run(false);
		},

		updateGame : function(e)
		{
			// run the game
			if ( this.delegate )
				this.delegate.run(e);
		},

		updateStage : function(e)
		{
			// update each stage
			for ( var i = 0; i < this.stages.length; i++ )
				this.stages[i].update(e);
		},

		setupElements : function()
		{
			this.wrapper = ph.$('#game-wrapper') || ph.$new('div');
			this.wrapper.id = 'game-wrapper';
			document.body.appendChild(this.wrapper);
		},

		// creates a canvas and stage
		addStage : function()
		{
			if ( !this.wrapper )
				return;

			var canvas = ph.$new('canvas');
			this.wrapper.appendChild(canvas);

			var stage = new createjs.Stage(canvas);
			stage.preventSelection = false;

			// enable touch events
			if ( ph.device.mobile && createjs.Touch.isSupported() )
			{
				createjs.Touch.enable(stage);
				stage.enableDOMEvents(false);
				stage.snapToPixelEnabled = true;
			}
			else
				stage.enableMouseOver(30);

			// apply input
			new ph.Input(stage);
			ph.input.bind(ph.KEY.MOUSE1);

			// add to array
			this.stages.push(stage);

			// make the canvas the same size
			this._lastSize = 0;
			this.onWindowResize();

			return stage;
		},

		removeStage : function(index)
		{
			// passed the stage object? find the index
			if ( isNaN(index) )
				index = this.stages.indexOf(index);

			// remove the canvas
			var canvas = this.stages[index].canvas;
			canvas.parentNode.removeChild(canvas);

			// remove from array
			this.stages.splice(index, 1);
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
				styleObj = this.wrapper ? this.wrapper.style : this.canvas.style;

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
			styleObj.maxWidth = styleObj.maxHeight = styleObj.margin = '';
			styleObj.width = ~~(canWidth * scale) + 'px';
			styleObj.height = ~~(canHeight * scale) + 'px';
			styleObj.marginTop = ~~((winHeight - (canHeight * scale)) * 0.5) + 'px';

			setTimeout(function() { window.scrollTo && window.scrollTo(0, 0) }, 1);
			this._lastSize = winWidth + winHeight;
		},

		onPageShow : function() 
		{ 
			this.isFocused = 1;
			ph.music.play();
		},

		onPageHide : function() 
		{ 
			this.isFocused = -1;
			ph.music.pause();
		},

		onChange : function(e)
		{
			if ( document[this.hiddenEventType] )
				this.onPageHide();
			else
				this.onPageShow();
		}
	})
});
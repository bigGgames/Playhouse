jsm.module(
	'playhouse.timer'
)
.defines(function()
{
	ph.Timer = jsm.Class.extend(
	{
		target : 0,
		base : 0,
		last : 0,
		pausedAt : 0,
		ignoreTimeScale : false,
		
		init : function(seconds, ignoreTimeScale) 
		{
			this.base = ph.Timer.time;
			this.last = ph.Timer.time;
			this.ignoreTimeScale = !!ignoreTimeScale;
			
			this.target = seconds || 0
		},
		
		set : function(seconds) 
		{
			this.target = seconds || 0;
			return this.reset()
		},
		
		reset : function() 
		{
			this.base = this.ignoreTimeScale ? ph.Timer.timeIgnoreScale : ph.Timer.time;
			this.pausedAt = 0;
			return this
		},
		
		delta : function() 
		{
			if ( this.ignoreTimeScale )
				return (this.pausedAt || ph.Timer.timeIgnoreScale) - this.base - this.target;
			else
				return (this.pausedAt || ph.Timer.time) - this.base - this.target;
		},

		pause : function() 
		{
			if ( !this.pausedAt )
				this.pausedAt = this.ignoreTimeScale ? ph.Timer.timeIgnoreScale : ph.Timer.time;

			return this
		},

		resume : function() 
		{
			if ( this.pausedAt ) 
			{
				this.base += (this.ignoreTimeScale ? ph.Timer.timeIgnoreScale : ph.Timer.time) - this.pausedAt;
				this.pausedAt = 0;
			}

			return this
		}
	});

	ph.Timer._last = 0;
	ph.Timer.time = Number.MIN_VALUE;
	ph.Timer.timeIgnoreScale = Number.MIN_VALUE;
	ph.Timer.timeScale = 1;
	ph.Timer.maxStep = 0.05;

	ph.Timer.step = function() 
	{
		var current = Date.now(),
			delta = (current - ph.Timer._last) * 0.001,
			time = Math.min(delta, ph.Timer.maxStep);

		ph.Timer.time += time * ph.Timer.timeScale;
		ph.Timer.timeIgnoreScale += time;
		ph.Timer._last = current;
	}
});
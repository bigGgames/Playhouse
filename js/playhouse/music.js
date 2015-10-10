ph.module(
	'playhouse.music'
)
.defines(function()
{
	ph.Music = ph.Class.extend(
	{
		id : null,
		soundObj : null,

		staticInit : function()
		{
			if ( !ph.music )
				ph.music = this;

			return ph.music;
		},

		set : function(id, fadeTime, volume)
		{
			if ( this.id === id )
				return;

			this.id = id;

			if ( this.soundObj )
				this.fadeTo(0, fadeTime).wait(100).call(this._set, [id, fadeTime, volume], this);
			else
				this._set(id, fadeTime, volume);
		},

		_set : function(id, fadeTime, volume)
		{
			this.soundObj = createjs.Sound.play(id, { loop : -1, volume : 0 });
			this.fadeTo(volume || 1, fadeTime);
		},

		play : function()
		{
			if ( this.soundObj )
				this.soundObj.setPaused(false);
		},

		pause : function()
		{
			if ( this.soundObj )
				this.soundObj.setPaused(true);
		},

		stop : function(fadeTime)
		{
			this.fadeTo(0, fadeTime || 0).call(function() { this.soundObj = null }, null, this);
		},

		fadeTo : function(volume, fadeTime)
		{
			return createjs.Tween.get(this.soundObj).to({ volume : volume }, fadeTime || 600);
		}
	});

	new ph.Music();
});
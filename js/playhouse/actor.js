jsm.module(
	'playhouse.actor'
)
.defines(function()
{
	ph.Actor = jsm.Class.extend(
	{
		x : 0,
		y : 0,

		disObj : null,
		conName : '',

		screenX : 0.5,
		screenY : 0.5,

		stateIds : [],

		init : function(x, y, options)
		{
			this.x = x || this.x;
			this.y = y || this.y;
			jsm.merge(this, options || {});
		},

		update : function()
		{
			if ( this.disObj )
			{
				if ( this.screenX >= 0 )
					this.disObj.x = this.x + (this.screenX * ph.system.width);

				if ( this.screenY >= 0 )
					this.disObj.y = this.y + (this.screenY * ph.system.height);
			}
		},

		kill : function()
		{
			ph.scene && ph.scene.removeActor(this)
		},

		switchState : function() {},

		_interactionHandler : function(e)
		{
			switch ( e.type )
			{
				case 'click' : this.onClick(e); break;
				case 'mousedown' : this.onMousedown(e); break;
				case 'mouseover' : this.onMouseover(e); break;
				case 'mouseout' : this.onMouseout(e); break;
				case 'pressup' : this.onPressup(e); break;
			}
		},

		onClick : function() {},
		onMousedown : function() {},
		onMouseover : function() {},
		onMouseout : function() {},
		onPressup : function() {},
	})
});
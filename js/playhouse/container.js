ph.module(
	'playhouse.container'
)
.defines(function()
{
	ph.Container = ph.Class.extend(
	{
		containers : [],

		staticInit : function()
		{
			if ( !ph.container )
				ph.container = this;

			return ph.container;
		},
		
		update : function()
		{
			var w = ig.system.width,
				h = ig.system.height,
				i = 0,
				con;

			for ( ; i < this.containers.length; i++ )
			{
				con = this.containers[i];

				if ( typeof con.screenX === 'number' )
					con.x = w * con.screenX;

				if ( typeof con.screenY === 'number' )
					con.y = h * con.screenY;
			}
		},

		get : function(name)
		{
			for ( var i = 0, con; i < this.containers.length; i++ )
			{
				con = this.containers[i];
				if ( con.name === name )
					return con;
			}

			return null;
		},

		add : function(options, parent)
		{
			var con = new cjs.Container().set(options || {});

			(parent || ph.system.stage).addChild(con);

			this.containers.push( con );

			return con;
		},

		remove : function(con)
		{
			this.disable(con);
			con.parent.removeChild(con);
			this.containers.erase(con);
		},

		enable : function(con, callback, scope)
		{
			scope = scope || null;
			con.on('click', callback, scope);
			con.on('mousedown', callback, scope);
			con.on('mouseover', callback, scope);
			con.on('mouseout', callback, scope);
			con.on('pressup', callback, scope);
			con.mouseEnabled = true;
		},

		disable : function(con)
		{
			con.removeAllEventListeners();
			con.mouseEnabled = false;
		}
	});

	new ph.Container();
});
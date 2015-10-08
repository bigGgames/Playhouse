jsm.module(
	'playhouse.container'
)
.defines(function()
{
	ph.Container = jsm.Class.extend(
	{
		containers : [],

		staticInit : function()
		{
			return ph.con || null;
		},

		init : function()
		{
			ph.con = this;
		},

		update : function()
		{
			var w2 = ph.system.width * 0.5,
				h2 = ph.system.height * 0.5,
				i = 0,
				con;

			for ( ; i < this.containers.length; i++ )
			{
				con = this.containers[i];

				if ( typeof con.screenX === 'number' )
					con.x = w2 * con.screenX;

				if ( typeof con.screenY === 'number' )
					con.y = h2 * con.screenY;
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
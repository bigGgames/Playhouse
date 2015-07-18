jsm.module(
	'playhouse.scene'
)
.requires(
	'lib.create',
	'playhouse.actor'
)
.defines(function()
{
	ph.Scene = jsm.Class.extend(
	{
		x : 0,
		y : 0,

		containers : [],
		actors : [],

		currentStateId : -1,
		stateId : 
		{
			transit : 1,
			title : 2,
			menu : 3,
			game : 4,
			end : 5
		},

		staticInit : function()
		{
			ph.scene && ph.scene.dispose();
			ph.scene = this;
			return null
		},

		update : function()
		{
			var i = 0, actor, con;

			for ( ; actor = this.actors[i++]; )
				actor.update();

			for ( i = 0; con = this.containers[i++]; )
			{
				con.x = this.x * con.distance;
				con.y = this.y * con.distance;
			}
		},

		switchState : function(newStateId)
		{
			for ( var i = 0, actor; actor = this.actors[i++]; )
			{
				actor.switchState(newStateId, this.currentStateId);

				// just in case that actor was immediately removed
				if ( actor !== this.actors[i - 1] )
					i--;
			}

			// change the state
			this.currentStateId = this.stateId.transit;
		},

		addContainer : function(options)
		{
			var con = new createjs.Container;
			con.set(options || {});

			this.containers.push(con);

			ph.system.stage.addChild(con);

			if ( options.enable )
				this.enableContainer(con);

			this.sort();

			return con
		},

		getContainer : function(container)
		{
			for ( var i = 0, con; con = this.containers[i++]; )
				if ( con.name === container || con === container )
					return con;

			return null
		},

		removeContainer : function(container)
		{
			for ( var i = 0, con; con = this.containers[i++]; )
			{
				if ( con.name === container || con === container )
				{
					i--;
					this.disableContainer(con);
					this.containers.erase(con);
					ph.system.stage.removeChild(con);
				}
			}
		},

		enableContainer : function(container)
		{
			var con = this.getContainer(container);
			con.on('click', this._interactionHandler, this);
			con.on('mousedown', this._interactionHandler, this);
			con.on('mouseover', this._interactionHandler, this);
			con.on('mouseout', this._interactionHandler, this);
			con.on('pressup', this._interactionHandler, this);
		},

		disableContainer : function(container)
		{
			var con = this.getContainer(container);
			con.off('click', this._interactionHandler, this);
			con.off('mousedown', this._interactionHandler, this);
			con.off('mouseover', this._interactionHandler, this);
			con.off('mouseout', this._interactionHandler, this);
			con.off('pressup', this._interactionHandler, this);
		},

		_interactionHandler : function(e)
		{
			var actor = e.target.actor || null;
			actor && actor._interactionHandler(e);
		},

		addActor : function(type, x, y, options)
		{
			if ( !type )
				throw 'Can\'t add actor of type "' + type + '"';

			var actor = new type(x, y, options);

			if ( actor.disObj )
			{
				if ( actor.conName )
					this.getContainer(actor.conName).addChild(actor.disObj);

				else
					ph.system.stage.addChild(actor.disObj);

				this.sort();
			}

			this.actors.push(actor);

			return actor
		},

		getActor : function(name, actors, type)
		{
			this.getActors(name, actors, type)[0] || null
		},

		getActors : function(name, actors, type)
		{
			actors = actors || this.actors;

			var i = 0, 
				results = [], 
				actor;

			for ( ; actor = actors[i++]; )
			{
				if ( 
					(type && actor instanceof type && !name) || // match by type, name is undefined
					(type && actor instanceof type && actor.name === name) || // matching by type and name
					(!type && actor.name === name) // match by name, type is undefined
				)
					results.push(actor);
			}

			return results
		},

		removeActor : function(actor)
		{
			for ( var i = 0, act; act = this.actors[i++]; )
			{
				if ( act.name === actor || act === actor )
				{
					i--;
					this.actors.erase(act);
					act.disObj && act.disObj.parent.removeChild(act.disObj);
				}
			}
		},

		sort : function()
		{
			// first sort the stage's children (should be the containers)
			ph.system.stage.children.sort(this._sort);

			// now sort the containers children
			for ( var i = 0, con; con = this.containers[i++]; )
				con.children.sort(this._sort);
		},

		dispose : function()
		{
			while ( this.actors.length )
				this.actors.pop().kill();

			while ( this.containers.length )
				this.removeContainer(this.containers.pop());

			ph.scene = null
		},

		_sort : function(a, b)
		{
			return a.zIndex - b.zIndex
		}
	})
});
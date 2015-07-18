jsm.module(
	'playhouse.spritesheet'
)
.requires(
	'lib.create'
)
.defines(function()
{
	ph.SpriteSheet = jsm.Class.extend(
	{
		sheets : {},

		staticInit : function()
		{
			return ph.spritesheet || null
		},

		init : function()
		{
			ph.spritesheet = this
		},

		get : function(name)
		{
			return this.sheets[name] || null
		},

		set : function(name, atlas, images)
		{
			if ( !this.get(name) )
			{
				// was a spritesheet created outside?
				if ( atlas instanceof createjs.SpriteSheet )
				{
					this.sheets[name] = atlas;
					return this;
				}

				// we make one provided by the passed params

				var data = ph.loader.getResult(atlas);

				data.images.length = 0;

				images = typeof images === 'string' ? [images] : images;

				for ( var i = 0; i < images.length; i++ )
					data.images.push( ph.loader.getResult(images[i]) );

				this.sheets[name] = new createjs.SpriteSheet(data);
			}

			return this
		}
	});

	new ph.SpriteSheet;
});
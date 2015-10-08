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
			var ss = this.get(name);

			if ( !ss )
			{
				// was a spritesheet created outside?
				if ( atlas instanceof createjs.SpriteSheet )
					ss = atlas;

				// we make one provided by the passed params
				else
				{
					var data = ph.loader.getResult(atlas);

					data.images.length = 0;

					images = typeof images === 'string' ? [images] : images;

					for ( var i = 0; i < images.length; i++ )
						data.images.push( ph.loader.getResult(images[i]) );

					ss = new createjs.SpriteSheet(data);
				}

				this.sheets[name] = ss;
			}

			return ss
		}
	});

	new ph.SpriteSheet();
});
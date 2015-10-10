ph.module(
	'playhouse.spritesheet'
)
.defines(function()
{
	ph.SpriteSheet = ph.Class.extend(
	{
		sheets : {},

		staticInit : function()
		{
			if ( !ph.spritesheet )
				ph.spritesheet = this;

			return ph.spritesheet;
		},

		get : function(name)
		{
			return this.sheets[name] || null;
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
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
				var data = ph.loader.getResult(atlas);

				data.images.length = 0;

				images = typeof images === 'string' ? [images] : images;

				for ( var i = 0; i < images.length; i++ )
					data.images.push( ph.loader.getResult(atlas) );

				this.sheets[name] = new createjs.SpriteSheet(data);
			}

			return this
		}
	});
});
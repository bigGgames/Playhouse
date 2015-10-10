ph.module(
	'game.main'
)
.requires(
	'game.assets',
	'playhouse.system',
	'lib.createjs.lib'
)
.defines(function()
{
	ph.Game = ph.Class.extend(
	{
		staticInit : function()
		{
			return ph.game || null
		},

		init : function()
		{
			ph.game = this;

			alert('Welcome to the Playhouse!');
		},

		update : function()
		{
			
		}
	})

	ph.loader.load(ph.assets('prereq'), function()
	{
		new ph.System(ph.Game, ph.config.gameDimensions)
	})
});
jsm.module(
	'game.main'
)
.requires(
	'lib.create',

	'playhouse.system'
)
.defines(function()
{
	ph.Game = jsm.Class.extend(
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

	new ph.System(ph.Game, ph.config.gameDimensions)
});
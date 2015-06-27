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

			alert('Welcome to the Playhouse... not much at the moment, sorry');

			
		},

		update : function()
		{
			
		}
	})

	new ph.System(ph.Game, ph.config.gameDimensions)
});
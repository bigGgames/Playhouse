jsm.module(
	'playhouse.scene'
)
.requires(
	'lib.create'
)
.defines(function()
{
	ph.Scene = jsm.Class.extend(
	{
		x : 0,
		y : 0,

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
			ph.scene = this;
			return null
		}
	});
});
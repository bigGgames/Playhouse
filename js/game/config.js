// create the Playhouse global var
if ( window.ph )
	throw 'Playhouse global var "ph" can\'t be created?!';

window.ph = {};

// our game/playhouse config
ph.config =
{
	gameDimensions :
	{
		widthMin : 240,
		widthMax : 284,
		heightMin : 160,
		heightMax : 192
	}
};
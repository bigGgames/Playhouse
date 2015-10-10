// must do this for JSM and Playhouse
ph.module(
	'lib.createjs.lib'
)
.defines(function()
{
	if ( !window.cjs )
		window.cjs = createjs;

	cjs.DisplayObject.prototype.zIndex = 0;
	cjs.DisplayObject.prototype.mouseEnabled = false;

	cjs.Container.prototype.sort = function(deep)
	{
		this.children.sort(this._sort);

		// deep sort? check the children for more containers
		if ( deep )
		{
			for ( var i = 0, child; i < this.children.length; i++ )
			{
				child = this.children[i];
				if ( child instanceof cjs.Container )
					child.sort(deep);
			}
		}
	};

	cjs.Container.prototype._sort = function(a, b)
	{
		return a.zIndex - b.zIndex;
	};
});
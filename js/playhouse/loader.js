ph.module(
	'playhouse.loader'
)
.requires(
	'lib.create'
)
.defines(function()
{
	ph.Loader = ph.Class.extend(
	{
		status : 0,

		loadCallback : null,
		loadQueue : null,

		_loadedObjects : {},

		staticInit : function()
		{
			return ph.loader || null;
		},

		init : function()
		{
			ph.loader = this;

			createjs.Sound.registerPlugins([ createjs.WebAudioPlugin, createjs.HTMLAudioPlugin ]);
			createjs.Sound.alternateExtensions = ['mp3', 'ogg'];
			createjs.Sound.EXTENSION_MAP.mp3 = 'mpeg';

			if ( ph.device.mobile && createjs.WebAudioPlugin.isSupported() )
				document.addEventListener('touchstart', function firstTouch()
				{
					document.removeEventListener('touchstart', firstTouch, false);
					createjs.WebAudioPlugin.playEmptySound();
				});
		},

		load : function(manifest, callback)
		{
			this.loadCallback = callback || this.loadCallback;

			// check to see if we already loaded some of the objects/assets
			for ( var i = 0; i < manifest.length; i++ )
			{
				if ( this.getResult(manifest[i].id) )
				{
					manifest.splice(i, 1);
					i--;
				}
			}

			for ( i = 0; i < manifest.length; i++ )
			{
				// nocache
				manifest[i].src += ph.nocache;

				// TODO
				// scaling
				// manifest[i].src = manifest[i].src.replace('{scale}', 100);
			}

			if ( manifest.length )
				this.loadManifest(manifest);
			else
				this.handleComplete();
		},

		unload : function(manifest)
		{
			for ( var i = 0, id; id = manifest[i].id; )
			{
				this._loadedObjects[ id ] = null;
				delete this._loadedObjects[ id ];
			}
		},

		loadManifest : function(manifest) 
		{
			if ( !this.loadQueue ) 
			{
				this.status = 0;
				this.loadQueue = new createjs.LoadQueue(false);
				this.loadQueue.setMaxConnections(8);
				this.loadQueue.installPlugin(createjs.Sound);
				this.loadQueue.on('fileload', this.handleFileload, this);
				this.loadQueue.on('complete', this.handleComplete, this)
			}

			this.loadQueue.loadManifest(manifest)
		},

		handleFileload : function(e) 
		{
			this.status = this.loadQueue ? this.loadQueue.progress : this.status;

			this._loadedObjects[e.item.id] = e.result;
		},

		handleComplete : function(e) 
		{
			this.status = 1;
			this.loadCallback && this.loadCallback();

			this.loadCallback = null;
			this.loadQueue = null;
		},

		getResult : function(id) 
		{
			return this._loadedObjects[id] || null
		}
	});

	new ph.Loader
});
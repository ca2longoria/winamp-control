
/**
WinAmp control script, node.js-side

author: Cesar A. Longoria II
copyright 2015, no rights reserved; use for whatever.
*/

fs = require('fs');
http = require('http');
cp = require('child_process');

config = Object.freeze(JSON.parse(fs.readFileSync(__dirname+'\\config.json')));
pwd = process.cwd();

http.createServer(function(req,res)
{
	if (req.url === '/')
	{
		fs.readFile(__dirname+'\\index.html',function(err,data)
		{
			if (err)
			{ console.log(err); return; }
			
			res.writeHead(200,{
				'Content-Type':'text/html'
			});
			res.end(data);
		});
	}
	else
	{
		var valid = {
			'prev10':true,
			'previous':true,
			'play':true,
			'pause':true,
			'stop':true,
			'next':true,
			'next10':true,
			
			'shuffle':true,
			'repeat':true,
			
			'volup':true,
			'voldown':true
		};
		var validMsg = {
			'gettrack':'Get Track',
			'playlist':'Playlist'
		};

		var command = req.url.replace(/^\/([^\?]+)(\?.*)?$/,'$1');
		var keys = [];
		var queries = (function(ob)
		{
			req.url.replace(/^\/([^\?]+)(\?(.*))?$/,'$3')
				.split('&')
				.map(function(s)
				{
					var a = s.split('=');
					var b = a.slice(1).join('=');
					ob[a[0]] = (b.length > 0 ? b : true);
					keys.push(a[0]);
				});
			return ob;
		})({});
		console.log('queries',queries);
		
		// If the url follows the Message Queue archetype...  ...  Archetype?
		if (keys.length && command === 'msg')
		{
			console.log('running query command:',command,queries);
			
			var args = [];
			for (var p in queries)
				args.push(decodeURIComponent(p+' '+queries[p]));
			
			// Function to handle the start and end of running control.ahk.
			function runChildProcess(stdout,stderr,close)
			{
				var execString =
					'"'+config.autoHotkeyExe+'" '
					+ __dirname+'\\control.ahk '+command+' '
					+ args.join(' ');
				console.log('exec string:',execString);
				
				//*
				var child = cp.exec(execString);
				
				var stdoutCallback = (stdout ? stdout : function(data)
				{ console.log('out:',data) });
				var stderrCallback = (stderr ? stderr : function(data)
				{ console.log('error:',data) });
				var closeCallback = (close ? close : function(code)
				{ console.log('close:',code); res.end('closed:'+code); });
				
				child.stdout.on('data',stdoutCallback);
				child.stderr.on('data',stderrCallback);
				child.on('close',closeCallback);
				//*/
			}
			
			// Special cases (where output is important)
			if (queries['playlist'])
			{
				var startTime = new Date();
				
				runChildProcess(null,null,
				function(code)
				{
					var currentTrack = parseInt(code);
					console.log('currentTrack:',code);
					
					openRecentFile([
							config.m3uDir+'\\winamp.m3u',
							config.winampDir+'\\winamp.m3u'
						],
						function(path,data)
						{
							// Parse the m3u file.
							var list = parseM3U(data.toString());
							list[currentTrack].currentTrack = true;
							
							var response = JSON.stringify(list);
							
							//console.log('SUCCESS!',data.toString());
							res.writeHead(200,{
								'Content-Type':'text/plain'
							});
							res.end(response);
						},
						1000,
						function()
						{ console.log('FAILURE!?  What do we do!?') },
						50,
						startTime
					);
				});
			}
			
			else
			{
				// None of the above, just do the norm.
				runChildProcess();
			}
		}
		
		else if (valid[command])
		{
			console.log('running command:',command);
			
			var child = cp.exec(__dirname+'\\control.ahk '+command);
			child.stdout.on('data',function(data)
			{ console.log('out:',data) });
			child.stderr.on('data',function(data)
			{ console.log('error:',data) });
			child.on('close',function(code)
			{ console.log('close:',code); res.end('closed:'+code); });
		}
		else
		{
			console.log('invalid command:',req.url);
			res.writeHead(400);
			res.end('INVALID COMMAND');
		}
	}	
}).listen(config.port);

/**
Returns the contents of an m3u playlist file as an Array populated by objects
as follows:

{
	artist:<string>,
	title:<string>,
	length:<number>, (in seconds)
	path:<string>
}
*/
function parseM3U(dataString)
{
	var deese = [];
	dataString.split(/\n/)
		.slice(1)
		.map(function(line)
		{
			if (line[0] === '#')
			{
				var tokens = line.split(/[:,]/);
				
				var length = parseInt(tokens[1]);
				var artist = null;
				var title = null;
				
				if (tokens[2].indexOf(' - ') > 0)
				{
					var a = tokens[2].split(' - ');
					artist = a[0];
					title = a[1];
				}
				else
					title = tokens[2];
				
				deese.push({
					artist:artist,
					title:title,
					length:length,
					path:null
				});
			}
			else
				deese[deese.length-1].path = line;
		});
	
	return deese;
}

/**
Opens a file from a list of possible pathnames (for cases of newer or
preferable versions), while providing a check to ensure they were last modified
after a given time.  If they exist, they must be new.

paths:              string | Array<string> | iterable<*,string>
callback:           function(firstValidPath,fileData)
timeout:            number (milliseconds)
timeoutCallback:    function()
interval:           number (milliseconds)
newerThanTimestamp: number (milliseconds) | Date
*/
function openRecentFile(paths,callback,
                        timeout,timeoutCallback,interval,
                        newerThanTimestamp)
{
	paths = (typeof paths === 'string'
		? [paths]
		: (Array.isArray(paths)
			? paths
			: (function(a)
			  { var b=[]; for (var i in a) b.push(a[i]); return b })(paths)));
	
	timeout = (typeof timeout === 'number' ? timeout : 5000); // default 5s
	
	interval = (interval ? interval : 100);
	
	newerThanTimestamp = (typeof newerThanTimestamp === 'number'
		? newerThanTimestamp
		: (newerThanTimestamp instanceof Date
			? newerThanTimestamp.getTime()
			: 0));
	
	// Go through the files once, or each time...?  Each time.  We have to
	// consider the possibility that they haven't been created, yet.
	
	var startTime = new Date().getTime();
	var maxTime = (timeout > 0 ? startTime + timeout : 0x7fffffff);
	
	function rec(pathList)
	{
		console.log('rec('+pathList+')');
		
		if (!pathList || pathList.length === 0)
		{
			if (maxTime < new Date().getTime())
			{
				timeoutCallback();
				return;
			}
			
			// And start over...  Hey, this isn't really recursion, is it?
			setTimeout(function(){rec(paths)},interval);
			return;
		}
		
		fs.stat(pathList[0],function(err,stats)
		{
			if (!stats.isFile())
			{
				rec(pathList.slice(1));
				return;
			}
			
			// File exists!  Now to check if it's newer.
			if (stats.mtime.getTime() < newerThanTimestamp)
			{
				rec(pathList.slice(1));
				return;
			}
			
			// File exists *and* is newer than the specified time!
			fs.readFile(pathList[0],function(err,data)
			{
				callback(pathList[0],data);
			});
		});
	};
	
	rec(paths);
}


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
		var command = req.url.replace(/^\/([^\?]+)(\?.*)?$/,'$1');
		var keys = [];
		var queries = (function(ob)
		{
			req.url.replace(/^\/([^\?]+)(\?(.*))?$/,'$3')
				.split('&')
				.map(function(s)
				{
					var a = s.split('=');
					keys.push(a[0]);
					ob[a[0]] = a.slice(1).join('=');
				});
			return ob;
		})({});
		console.log('queries',queries);
		
		if (keys.length > 0)
		{
			console.log('running query command:',command,queries);
			
			var args = [];
			for (var p in queries)
			{
				args.push(decodeURIComponent(p+' '+queries[p]));
			}
			var execString =
				__dirname+'\\control.ahk '+command+' '
				+ args.join(' ');
			console.log('exec string:',execString);
			
			var child = cp.exec(execString);
			
			child.stdout.on('data',function(data)
			{ console.log('out:',data) });
			child.stderr.on('data',function(data)
			{ console.log('error:',data) });
			child.on('close',function(code)
			{ console.log('close:',code); res.end('closed:'+code); });
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

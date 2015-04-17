
fs = require('fs');
http = require('http');
cp = require('child_process');

config = Object.freeze(JSON.parse(fs.readFileSync('config.json')));
pwd = process.cwd();

http.createServer(function(req,res)
{
	if (req.url === '/')
	{
		fs.readFile(config.execDir+'\\index.html',function(err,data)
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
		var command = req.url.slice(1);
		
		if (valid[command])
		{
			console.log('running command:',command);
			
			var child = cp.exec(config.execDir+'\\control.ahk '+command);
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

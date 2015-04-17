
fs = require('fs');
http = require('http');
cp = require('child_process');

pwd = process.cwd();
assumedDir = 'C:\\Users\\Cesar\\bin\\winamp-control';

http.createServer(function(req,res)
{
	if (req.url === '/')
	{
		fs.readFile(assumedDir+'\\index.html',function(err,data)
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
		
		console.log('running command:',command);
		
		if (valid[command])
		{
			console.log('running command:',command);
			
			var child = cp.exec(assumedDir+'\\control.ahk '+command);
			child.stdout.on('data',function(data)
			{ console.log('out:',data) });
			child.stderr.on('data',function(data)
			{ console.log('error:',data) });
			child.on('close',function(code)
			{ console.log('close:',code); res.end('closed:'+code); });
		}
		else
		{
			console.log(req.url);
			res.end('SOMETHING SURELY');
		}
	}	
}).listen(11711);

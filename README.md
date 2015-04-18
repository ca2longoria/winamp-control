# winamp-control
A tiny toy application to control a winamp window from the local network, uses **node.js** and **AutoHotkey**.

Runs on **Windows**.

Threw this together while bunking down elsewhere in my apartment to draw, and growing frustrated with having to get up every few minutes to mess with the music player.

Put it on GitHub, because why not?

### Usage

Start up the server with *node <path-to-repo>\server.js*.  It will pull the port specified in *config.json*.

Available commands:
* prev10
* previous
* play
* pause
* stop
* next
* next10
* shuffle
* repeat
* volup
* voldown

Use with an http request, using host IP, port, and command:

{host-ip}:{port}/
* *index page*

{host-ip}:{port}/{command}
* *server takes command and passes it to control.ahk*

Examples:
* 192.168.1.182:11711/
* 192.168.1.182:11711/play
* 192.168.1.182:11711/voldown
* 192.168.1.182:11711/stop

### To-do list
- [x] could use a config file, instead of that blatant path literal... and for the port, too
- [ ] perhaps get the button/action list from the server and render the html divs on its own

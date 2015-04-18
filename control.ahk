
; WinAmp control script, AutoHotkey-side
; 
; author: Cesar A. Longoria II
; copyright 2015, no rights reserved; use for whatever.

key = %1%

if key = prev10
	key = {Numpad1}
else if key = previous
	key := "z"
else if key = play
	key := "x"
else if key = pause
	key := "c"
else if key = stop
	key := "v"
else if key = next
	key := "b"
else if key = next10
	key = {Numpad3}

else if key = repeat
	key := "r"
else if key = shuffle
	key := "s"

else if key = volup
	key = {Up 6}
else if key = voldown
	key = {Down 6}

SetTitleMatchMode, 2
WinActivate, Winamp

WinWaitActive, Winamp

FileAppend, key: %key%, output
ControlSend, ahk_parent, %key%

Exit

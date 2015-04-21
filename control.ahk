
; WinAmp control script, AutoHotkey-side
; 
; author: Cesar A. Longoria II
; copyright 2015, no rights reserved; use for whatever.

#Include wa_ipc.ahk

SetTitleMatchMode, 2

key = %1%

if key = msg
{
	thing = %2%
	if thing = gettrack
	{
		SendMessage, 0x400, 0, %IPC_GETLISTPOS%,, ahk_class Winamp v1.x
		res = %ErrorLevel%
		if res <> FAIL
		{
			FileAppend, gettrack ErrorLevel: %res%, output
			ExitApp, %res%
		}
	}
	else if thing = playlist
	{
		SendMessage, 0x400, 0, %IPC_WRITEPLAYLIST%,, ahk_class Winamp v1.x
		res = %ErrorLevel%
		if res <> FAIL
		{
			; Didn't fail... well, now server.js has to do some file reading.
			FileAppend, playlist ErrorLevel: %res%, output
			ExitApp, %res%
		}
	}
	Exit
}

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

WinActivate, - Winamp

WinWaitActive, - Winamp

FileAppend, key: %key%, output
ControlSend, ahk_parent, %key%

Exit

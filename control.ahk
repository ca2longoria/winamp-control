
; WinAmp control script, AutoHotkey-side
; 
; author: Cesar A. Longoria II
; copyright 2015, no rights reserved; use for whatever.

SetTitleMatchMode, 2

key = %1%

if key = test
{
	thing = %2%
	if thing = gettrack
	{
		;SendMessage, 1024, 0, 120, , - Winamp
		;SendMessage, 0x400, 0, 120, ahk_class BaseWindow_RootWnd
		;SendMessage, 0x400, 0, 120, , - Winamp
		;PostMessage, 0x400, 0, 0, , - Winamp
		;PostMessage, 0x111, 40045, 0, , - Winamp
		;WinActivate, - Winamp
		;PostMessage, 0x111, 40047, 0, Winamp PE1, - Winamp
		;PostMessage, 0x400, 0, 102, BaseWindow_RootWnd2, - Winamp
		;PostMessage, 0x400, 0, 120, Winamp PE1, - Winamp
		SendMessage, 0x400, 0, 120, , ahk_class Winamp v1.x
		;WinActivate, ahk_class BaseWindow_RootWnd
		if ErrorLevel <> FAIL
		{
			FileAppend, ErrorLevel: %ErrorLevel%, output
		}
		else
			FileAppend, ErrorLevel FAIL: %ErrorLevel%, output
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

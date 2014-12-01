/*
*	Miucode text editor version 2.0 Beta
*	Author: Mihkel Oviir
*
*	This work is licensed under MIT License, see http://www.opensource.org/licenses/mit-license.php
*
*/
// Main javascript code

// random string generator for ie caching problem
function rnd(){ return String((new Date()).getTime()).replace(/\D/gi,''); }

$(document).ready( function() {
	$('label').labelOver('over');
	// submit loginform
	$('#Password').keypress(function(e) {
        var KeyID = (window.event) ? event.keyCode : e.keyCode;
		if(KeyID == 13) {
			document.loginform.submit();
			return false;
		}
    });
});
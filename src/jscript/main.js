/*
*	Miucode text editor version 2.0 Beta
*	Author: Mihkel Oviir
*
*	This work is licensed under MIT License, see http://www.opensource.org/licenses/mit-license.php
*
*/
// Main javascript code

var Editor;

// random string generator for ie caching problem
function rnd(){ return String((new Date()).getTime()).replace(/\D/gi,''); }
// file extension
function getExtension(file) {
	if( file.length === 0 ) {return '';}
	var dot = file.lastIndexOf('.');
	if(dot == -1) {return '';}
	var extension = file.substr(dot+1,file.length);
	return extension;
}

// make modal overlay
$.fn.makemodal = function(){

	//Get the screen height and width
	var maskHeight = $(document).height();
	var maskWidth = $(window).width();

	//Set heigth and width to mask to fill up the whole screen
	$('.overlay').css({'width':maskWidth,'height':maskHeight});

	//Get the window height and width
	var winH = $(window).height();
	var winW = $(window).width();

	//Set the popup window to center
	$(this).css('top',  winH/2-$(this).height()/2);
	$(this).css('left', winW/2-$(this).width()/2);

	//transition effect
	$('.overlay').show();
	$(this).show();

	//if close button is clicked
	$('.window .close').click(function (e) {
		//Cancel the link behavior
		e.preventDefault();

		$('.overlay').hide();
		$('.window').hide();
		$('.window label').css("color","#ccc");
		$('#newfolder label').css("color","#ccc");
		$('#newform #path').html('');
		$('#newfolder #path').html('');
	});
};

// filetree
$.fn.fileTree = function(o, h) {

	// Defaults
	if( !o ) { o = {};}
	if( o.root === undefined ) {o.root = '/';}
	if( o.script === undefined ) {o.script = 'request.php?action=filetree';}
	if( o.folderEvent === undefined ) {o.folderEvent = 'dblclick';}
	if( o.expandSpeed === undefined ) {o.expandSpeed= 1;}
	if( o.collapseSpeed === undefined ) {o.collapseSpeed= 1;}
	if( o.expandEasing === undefined ) {o.expandEasing = null;}
	if( o.collapseEasing === undefined ) {o.collapseEasing = null;}
	if( o.loadMessage === undefined ) {o.loadMessage = 'Loading...';}

	$(this).each( function() {

		function showTree(c, t) {
			$('#bdirdel').parent().removeClass('button').addClass('disabled');
			$(c).addClass('wait');
			$(".jqueryFileTree.start").remove();
			$.post(o.script, { dir: t }, function(data) {
				$(c).find('.start').html('');
				$(c).removeClass('wait').append(data);
				if( o.root == t ) {$(c).find('UL:hidden').show();} else {$(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });}
				bindTree(c);
			});
		}

		function bindTree(t) {
			$(t).find('LI A').bind(o.folderEvent, function() {
				if( $(this).parent().hasClass('directory') ) {
					if( $(this).parent().hasClass('collapsed') ) {
						// Expand
						$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
						$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
						$(this).parent().find('UL').remove(); // cleanup
						showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
						$(this).parent().removeClass('collapsed').addClass('expanded');
						$('#bdirdel').parent().removeClass('disabled').addClass('button');
						h({i:1,file:$(this).attr('rel'),id:$(this).parent().attr('id')});
					} else {
						// Collapse
						$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
						$(this).parent().removeClass('expanded').addClass('collapsed');
						if ($(this).parent().parent().parent().is('li') ) {
							var parenta = $(this).parent().parent().parent().find('a');
							h({i:2,file:parenta.attr('rel'),id:parenta.parent().attr('id')});
						} else {
							$('#bdirdel').parent().removeClass('button').addClass('disabled');
							h({i:2,file:'',id:''});
						}
					}
				} else {
					h({i:0,file:$(this).attr('rel'),id:$(this).parent().attr('id')});
				}
				return false;
			});
			// Prevent A from triggering the # on non-click events
			if( o.folderEvent.toLowerCase != 'click' ) {$(t).find('LI A').bind('click', function() { return false; });}
		}
		// Loading message
		$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
		// Get the initial file list
		showTree( $(this), escape(o.root) );
	});
};

// init filetree
$.fn.initfiletree = function(path) {
	var pathlength = path.length;
	$(this).fileTree({root: path}, function(filedata) {

		var file = filedata.file.substr(pathlength);
		var id = filedata.id;

		if(filedata.i===0){
			// get file content
			$.getJSON('request.php?action=get&file='+file+'&'+rnd(), function(data){
				if(data.error===0){
					$('input[name=file]').val(file);
					$('input[name=file]').attr('id',id);
					$('#rightcolumn h2').html('<a href="'+path+file+'" target="_blank">'+file+'</a>');
					var mode = 'text/html';
					switch(getExtension(file)){
						case 'php': mode = 'php';break;
						case 'js': mode = 'javascript';break;
						case 'css': mode = 'css';break;
					}
					
					Editor.setOption("mode", mode);
					Editor.setValue(data.d);
					$('#bdelete').parent().removeClass('disabled').addClass('button');
					$('#bclose').parent().removeClass('disabled').addClass('button');
				}else{ alert(data.d);}
			});
		} else if(filedata.i==1){
			// current folder open
			$('input[name=folder]').val(file);
			$('input[name=folder]').attr('id',id);
		} else if(filedata.i==2){
			// move to parent folder
			$('input[name=folder]').val(file);
			$('input[name=folder]').attr('id',id);
		}
	});
};

$(document).ready( function() {

	//labels over inputs
	$(function() {$('label').labelOver('over');});
	
	Editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		lineNumbers: true,
		mode:"text/html",
		matchBrackets:true,
		indentUnit:2,
		indentWithTabs:true,
		enterMode:"keep",
		tabMode:"shift",
		onCursorActivity: function(){
			Editor.setLineClass(htmlLine,null);
			htmlLine = Editor.setLineClass(Editor.getCursor().line, "activeline");
		},
		onChange: function(i){
	        if($('input[name=file]').val()==''){
					$('#bsave').parent().removeClass('disabled').addClass('button');
					$('#bclose').parent().removeClass('disabled').addClass('button');
	        } else {
				$('#bsave').parent().removeClass('disabled').addClass('button');
			}
	    }
	});
	var htmlLine = Editor.setLineClass(0, "activeline");

	// prevent clicks to disabled links
    $('.disabled').live('click',function(e){e.preventDefault();});


	// set windows height
	var initheight = $('#leftcolumn').height();
	$('.CodeMirror-scroll, .CodeMirror-gutter').height(initheight-40);
	$('#filetree').height(initheight-50);

	// set windows height on resize
	$(window).resize(function(){
		var height = $('#leftcolumn').height();
		$('.CodeMirror-scroll, .CodeMirror-gutter').height(height-40);
		$('#filetree').height(height-50);
	});

	// init filetree
	$('#filetree').initfiletree(path);

	// editbuttons
	$('.button').live('click',function(e){
		e.preventDefault();
		var current = $(this).attr('href');
		switch(current){
			case 'save':
				if($('input[name=file]').val()==''){
					$('#newform #path').append('Save to: '+$('input[name=folder]').val());
					$(function() {$('#newform').makemodal();});
				} else {
					var file = $('input[name=file]').val();
					var content = Editor.getValue();
					var data = 'file='+file+'&content='+encodeURIComponent(content);
					$.post('request.php?action=save&'+rnd(), data, function(html){
						if(html==1){
							$('#bsave').parent().removeClass('button').addClass('disabled');
						} else {alert(html);}
					});
				}
			break;
			case 'new':
				if($('input[name=new]').val()==''){
					$('#newform label').css("color","red");
				} else {
					$('#newform label').css("color","#ccc");
					var file = $('input[name=folder]').val()+$('input[name=new]').val();
					var content = Editor.getValue();
					var data = 'file='+file+'&content='+encodeURIComponent(content);
					$.post('request.php?action=new&'+rnd(), data, function(html){
						if(html==1){
							$('input[name=file]').val(file);
							$('input[name=file]').attr('id','new_file');
							$('#filetree').initfiletree(path);
							$('#rightcolumn h2').html('<a href="'+path+file+'" target="_blank">'+file+'</a>');
							$('input[name=new]').val('');
							$('#newform #path').html('');
							$('#bdelete').parent().removeClass('disabled').addClass('button');
							$('#bsave').parent().removeClass('button').addClass('disabled');
						} else {alert(html);}
					});
					$('.overlay').fadeOut('fast');
					$('.window').fadeOut('fast');
				}
			break;
			case 'delete':
				$(function() {$('#delconfirm').makemodal();});
			break;
			case 'delyes':
				var data = 'file='+$('input[name=file]').val();
				$.post('request.php?action=delete&'+rnd(), data, function(html){
				if(html==1){
						$('#filetree').initfiletree(path);
						$('input[name=file]').val('');
						$('input[name=file]').attr('id','');
						Editor.setValue('');
						$('#rightcolumn h2').html('New File');
						$('.overlay').fadeOut('fast');
						$('.window').fadeOut('fast');
						$('#bsave').parent().removeClass('button').addClass('disabled');
						$('#bclose').parent().removeClass('button').addClass('disabled');
						$('#bdelete').parent().removeClass('button').addClass('disabled');
					} else {alert(html);}
				});
			break;
			case 'close':
				$('input[name=file]').val('');
				$('input[name=file]').attr('id','');
				Editor.setValue('');
				$('#newform').fadeOut('slow');
				$('#rightcolumn h2').html('New File');
				$('#bsave').parent().removeClass('button').addClass('disabled');
				$('#bclose').parent().removeClass('button').addClass('disabled');
				$('#bdelete').parent().removeClass('button').addClass('disabled');
			break;
			case 'newdir':
				$('#newfolder #path').append('Save to: '+$('input[name=folder]').val());
				$(function() {$('#newfolder').makemodal();});
			break;
			case 'newdiryes':
				if($('input[name=newdir]').val()==''){
					$('#newfolder label').css("color","red");
				} else {
					$('#newfolder label').css("color","#ccc");
					var file = $('input[name=folder]').val()+$('input[name=newdir]').val();
					var data = 'file='+file;
					$.post('request.php?action=newdir&'+rnd(), data, function(html){
						if(html==1){
							$('#filetree').initfiletree(path);
							$('input[name=folder]').val('');
							$('input[name=newdir]').val('');
							$('#newfolder #path').html('');
						} else {alert(html);}
					});
					$('.overlay').fadeOut('fast');
					$('.window').fadeOut('fast');
				}
			break;
			case 'deldir':
				$(function() {$('#delfolder').makemodal();});
			break;
			case 'deldiryes':
				var data = 'file='+$('input[name=folder]').val();
				$.post('request.php?action=deldir&'+rnd(), data, function(html){
					if(html==1){
						$('#filetree').initfiletree(path);
						$('input[name=folder]').val('');
						$('.overlay').fadeOut('fast');
						$('.window').fadeOut('fast');
					} else {alert(html);}
				});
			break;
			case 'help':
					$('#helppage').makemodal();
			break;
		}
	});

});
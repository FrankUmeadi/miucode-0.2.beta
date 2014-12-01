$(document).ready( function() {
	
	var Editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
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
		}
	});
	var htmlLine = Editor.setLineClass(0, "activeline");
	
});
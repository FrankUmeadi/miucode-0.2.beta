<?php

## Configuration file

//urls and paths
define('URL','http://'.$_SERVER['SERVER_NAME'].'/editor_path');// url
define('PATH',__FILE__.'/editor_path');// path
define('PATH_INC',PATH.'/includes');// server-side scripts
define('PATH_TMPL',PATH.'/templates');// templates

// app
define('STATUS',1);// status, change something else when managing page
define('BROWSE_PATH','../content/');// path, file explorer root
define('TEMPLATE','default');// application template (must correspond with folder name in template directory)
define('USER','user');// user
define('PSWD','pass');// user passwd
define('FORMATS',serialize(array('txt','html','htm','js','php','inc','css','xml','kml','gpx','sql'))); // allowed formats

// html replace
# definesarray
function definesArray(){
	$data = array();
	$data['def-libs']='jscript/libs';
	$data['def-tmpl']='templates/'.TEMPLATE;
	$data['def-path']=BROWSE_PATH;
	return $data;
}

# read file into variable
function parseFile($page){
	$fd = fopen($page,'r');
	$page = @fread($fd, filesize($page));
	fclose($fd);
	return $page;
}

# parsing html to find php tags
function replace_tags($page,$tags = array()) {
	$page=(@file_exists($page))? parseFile($page):$page;
	if(sizeof($tags) > 0){
		foreach ($tags as $tag => $data) {
			$page = str_replace('{_'.$tag.'_}',$data,$page);
		}
	}
	return $page;
}

?>
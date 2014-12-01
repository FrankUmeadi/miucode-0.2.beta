<?php

$data='';

if(!empty($_GET['action'])) {

	switch($_GET['action']) {

	# send file content
	case 'get':
		$json=array('error'=>1,'d'=>'');
		// select file
		if(empty($_GET['file'])) $json['d'] = 'File not selected!';
		else {
			if(@is_file(BROWSE_PATH.$_GET['file'])) {
				$ext = preg_replace('/^.*\./', '', $_GET['file']);
				if (in_array($ext, unserialize(FORMATS))) {
					$json['error'] = 0;
					$json['d'] = file_get_contents(BROWSE_PATH.$_GET['file']);
				} else $json['d'] = 'File not allowed!';

			} else $json['d'] = 'File not exists!';
		}
		$data = json_encode($json);
	break;

	# save
	case 'save':
		if(empty($_POST['file'])) $data = 'File not selected!';
		else {
			if(@is_file(BROWSE_PATH.$_POST['file'])) {
				$fs = fopen(BROWSE_PATH.$_POST['file'],'w') or die('Error on file opening!');
				fwrite($fs,trim(stripslashes($_POST['content'])));
				fclose($fs);
				$data = 1;
			} else $data = 'File not exists!';
		}
	break;
	# new
	case 'new':
		if(empty($_POST['file'])) $data = 'Filename not set!';
		else {
			$ext = preg_replace('/^.*\./', '', $_POST['file']);
			if (in_array($ext, unserialize(FORMATS))) {
				$fs = fopen(BROWSE_PATH.$_POST['file'], 'w') or die('Error on file opening!');
				fwrite($fs, trim(stripslashes($_POST['content'])));
				fclose($fs);
				$data = 1;
			} else $data = 'File not allowed!';
		}
	break;

	# delete
	case 'delete':
		if(empty($_POST['file'])) $data = 'File not selected!';
		else {
			unlink(BROWSE_PATH.$_POST['file']);
			$data = 1;
		}
	break;

	# new directory
	case 'newdir':
		if(empty($_POST['file'])) $data = 'Foldername not set!';
		else {
			mkdir(BROWSE_PATH.$_POST['file']);
			$data = 1;
		}
	break;

	# delete directory
	case 'deldir':

		function removedir($dirname){
			if (@is_dir($dirname))
				$dir_handle = opendir($dirname);
			if (!$dir_handle) return false;
			while($file = readdir($dir_handle)) {
				if ($file != '.' && $file != '..') {
					if (@is_file($dirname.'/'.$file)) unlink($dirname.'/'.$file);
					else removedir($dirname.'/'.$file);
				}
			}
			closedir($dir_handle);
			rmdir($dirname);
			return true;
		}

		if(empty($_POST['file'])) $data = 'Foldername not set!';
		else {
			removedir(BROWSE_PATH.$_POST['file']);
			$data = 1;
		}
	break;

	# send directory content
	case 'filetree':
		$_POST['dir'] = urldecode($_POST['dir']);
		if( file_exists($_POST['dir']) ) {
			$dirid = str_replace('/','_',substr($_POST['dir'], strlen(BROWSE_PATH)));
			$files = scandir($_POST['dir']);
			natcasesort($files);
			if( count($files) > 2 ) { /* The 2 accounts for . and .. */
				$data = "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
				$i=0;
				// All dirs
				foreach( $files as $file ) {
					if( file_exists($_POST['dir'] . $file) && $file != '.' && $file != '..' && is_dir($_POST['dir'] . $file) ) {
						$data .= "<li class=\"directory collapsed\" id=\"dir_".htmlentities($dirid.$i)."\"><a href=\"#\" rel=\"".htmlentities($_POST['dir'].$file)."/\">" . htmlentities($file) . "</a></li>";
					}
					$i++;
				}
				// All files
				foreach( $files as $file ) {
					if( file_exists($_POST['dir'] . $file) && $file != '.' && $file != '..' && !is_dir($_POST['dir'] . $file) ) {
						$ext = preg_replace('/^.*\./', '', $file);

						$data .= "<li class=\"file ext_$ext\" id=\"file_".htmlentities($dirid.$i)."\"><a href=\"#\" rel=\"".htmlentities($_POST['dir'].$file) . "\">" . htmlentities($file) . "</a></li>";
					}
					$i++;
				}
				$data .= "</ul>";
			}
		}
	break;
	}
}
echo $data;
?>
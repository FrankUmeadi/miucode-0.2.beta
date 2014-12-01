<?php

// include configuration
include './config.php';

// set session
include PATH_INC.'/session.php';
$sess = Session::getInstance();

// if we manage with page
if(STATUS != 1)
	$html=PATH_TMPL.'/'.TEMPLATE.'/html/outoforder.html';
else {
	if(isset($sess->dev_is_logged_in) && $sess->dev_is_logged_in === true){
		$html=PATH_TMPL.'/'.TEMPLATE.'/html/main.html';
		if (isset($_GET['logout'])) {
			unset($sess->dev_is_logged_in);
			header('Location: '.$PHP_SELF);
		}
	}else{
		$html=PATH_TMPL.'/'.TEMPLATE.'/html/login.html';
		if(isset($_POST['UserId']) && isset($_POST['Password'])) {
			if($_POST['UserId'] === USER && $_POST['Password'] === PSWD) {
				// set the session
				$sess->dev_is_logged_in = true;
				header('Location: '.$PHP_SELF);
			}
		}
	}
}

// replace all tags
$defines = definesArray();
echo replace_tags($html,$defines);

?>
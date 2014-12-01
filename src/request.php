<?php

// include configuration
include './config.php';

// set session
include PATH_INC.'/session.php';
$sess = Session::getInstance();

// if we manage with page
if(STATUS != 1) {
	die('Not allowed!');
}
else {
	if(isset($sess->dev_is_logged_in) && $sess->dev_is_logged_in === true){

		include PATH_INC.'/main.php';

	}
}
?>
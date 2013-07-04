<?php
	$configuration_file = $_POST['onSave']['data']['id'];
	
		
	$result = file_put_contents(realpath(dirname(__FILE__)) . '/' . $configuration_file, json_encode($_POST, JSON_PRETTY_PRINT));
	
	if ($result === false){
		echo json_encode(array(
			'status' => 'nok',
			'error' => 'unknown'		
		));
		exit;	
	}
	
	echo json_encode(array(
		'status' => 'ok',
		'error' => null
	));
	
?>
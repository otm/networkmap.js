<?php
	$data = json_decode(file_get_contents('php://input'), true);
	$configuration_file = $data['onSave']['data']['id'];
		
	$result = file_put_contents(realpath(dirname(__FILE__)) . '/' . $configuration_file, json_encode($data, JSON_PRETTY_PRINT));
	
	if ($result === false){
		echo json_encode(array(
			'status' => 'nok',
			'error' => 'Unknown: ' . realpath(dirname(__FILE__)) . ' conffile: ' . $configuration_file		
		));
		exit;	
	}
	
	echo json_encode(array(
		'status' => 'ok',
		'error' => null
	));
	
?>

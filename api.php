<?php

		require "./config.php";
		require "./twitteroauth/autoloader.php";
		use Abraham\TwitterOAuth\TwitterOAuth;

		$mode = $_GET['mode'];

		if($mode == 'twitter') {

			$connection = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token, $access_token_secret);
			$content = $connection->get("account/verify_credentials");

			$topic = $_GET['q'] . ' -RT';
			$statuses = $connection->get("search/tweets", array("q" => $topic, 'count' => 100, 'lang' => 'en'));

			echo json_encode($statuses);

		}

		if ($mode == 'sentiment') {
			$url = 'http://hjsentiment.herokuapp.com/check/' . $_GET['q'];
			$sentiment = file_get_contents($url);
			echo $sentiment;
		}

?>

// This file analyzes all tweets and displays the results on the web UI

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded (Safety check)
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Convert raw data into Tweet objects
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;
	
	// 1.1 Tweet Dates (Earliest and Latest)

	// Starting with earliest and latest tweet both being the first tweet in data, and checking every tweet thereafter
	let earliest_tweet = tweet_array[0].time;
	let latest_tweet = tweet_array[0].time;

	for (let tweet of tweet_array) {
		if (tweet.time < earliest_tweet) {
			earliest_tweet = tweet.time;
		}

		if (tweet.time > latest_tweet) {
			latest_tweet = tweet.time;
		}
	}

	// Formatting Dates
	let date_options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};

	document.getElementById('firstDate').innerText = earliest_tweet.toLocaleDateString('en-US', date_options);
	document.getElementById('lastDate').innerText = latest_tweet.toLocaleDateString('en-US', date_options);


	// 1.2 Tweet Categories (Completed, Live, Achievement, Misc)
	let completed = tweet_array.filter(tweet => tweet.source === "completed_event").length;
	let live = tweet_array.filter(tweet => tweet.source === "live_event").length;
	let achievements = tweet_array.filter(tweet => tweet.source === "achievement").length;
	let miscellaneous = tweet_array.filter(tweet => tweet.source === "miscellaneous").length;

	// Converted to percentages
	let completedPercentage = (completed / tweet_array.length) * 100
	let livePercentage = (live / tweet_array.length) * 100
	let achievementsPercentage = (achievements / tweet_array.length) * 100
	let miscellaneousPercentage = (miscellaneous / tweet_array.length) * 100

	// Display category counts
	document.getElementsByClassName('liveEvents')[0].innerText = live;
	document.getElementsByClassName('achievements')[0].innerText = achievements;
	document.getElementsByClassName('miscellaneous')[0].innerText = miscellaneous;

	// Update both completedEvents spans
	let completedElements = document.getElementsByClassName('completedEvents');
	for (let element of completedElements) {
		element.innerText = completed;
	}

	// Display percentages for each category
	document.getElementsByClassName('completedEventsPct')[0].innerText = completedPercentage.toFixed(2) + '%';
	document.getElementsByClassName('liveEventsPct')[0].innerText = livePercentage.toFixed(2) + '%';
	document.getElementsByClassName('achievementsPct')[0].innerText = achievementsPercentage.toFixed(2) + '%';
	document.getElementsByClassName('miscellaneousPct')[0].innerText =miscellaneousPercentage.toFixed(2) + '%';

	// 1.3 User-Written Tweets (count in completed)
	let writtenCount = tweet_array.filter(tweet => tweet.source === "completed_event" && tweet.written).length;
	let writtenPercentage = (writtenCount / completed) * 100;
	document.getElementsByClassName('written')[0].innerText = writtenCount;
	document.getElementsByClassName('writtenPct')[0].innerText = writtenPercentage.toFixed(2) + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
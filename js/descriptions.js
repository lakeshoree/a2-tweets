let writtenTweets = [] // Storing the user-written tweets so that all functions can access them

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	// First converting raw tweets into tweet objects
	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Filtering
	writtenTweets = tweet_array.filter(tweet => tweet.written);

	console.log("User-written tweets: ", writtenTweets.length);

	updateSearchResults();
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table

	let searchBox = document.getElementById('textFilter');
	// Have the input rerun whenver chars are added or removed
	searchBox.addEventListener('input', function() {
		updateSearchResults();
	});
}

// Updating the search results
function updateSearchResults() {

    let searchBox = document.getElementById('textFilter');
    let searchTerm = searchBox.value.trim();

    // Displaying the current search term
    document.getElementById('searchText').innerText = searchTerm;

    // Clear results when box is empty
    if (searchTerm === "") {
        document.getElementById('searchCount').innerText = 0;
        document.getElementById('tweetTable').innerHTML = "";
        return;
    }

    // Find matching user-written tweets
    let matchingTweets = writtenTweets.filter(tweet =>
        tweet.writtenText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Display the number of matching tweets
    document.getElementById('searchCount').innerText = matchingTweets.length;

    console.log("Search term:", searchTerm);
    console.log("Matching tweets:", matchingTweets.length);

    // 3.2 display matching tweets in the table

	let tableRows = matchingTweets.map((tweet, index) =>
    tweet.getHTMLTableRow(index + 1)
);

	// Join all rows into a single HTML string
	document.getElementById('tweetTable').innerHTML = tableRows.join("");
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
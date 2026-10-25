// Defines the Tweet class
class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.

        // normalizing all text to make comparisons easier
        let normalized_text = this.text.toLowerCase();

        // Completed Activites text check
        if (normalized_text.startsWith("just completed") ||
            normalized_text.startsWith("just posted") ||
            normalized_text.startsWith("i just ran with")) {
            return "completed_event";
        }

        // Live activities text check
        if (normalized_text.startsWith("watch my") ||
            normalized_text.includes("#rklive")) {
        return "live_event";
        }

        // Achievement text check
        if (normalized_text.startsWith("achieved a new personal record") ||
            normalized_text.includes("set a goal on #runkeeper")) {
        return "achievement";
        }
        
        // If nothing starting matches then return miscellaneous
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        // Simply checking if empty string or not
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        //TODO: parse the written text from the tweet

        // Remove all URL and #Runkeeper which indicates app written update
        let trimmed = this.text.replace(/https?:\/\/\S+/g, "").replace(/#runkeeper/gi, "").trim();

        // Many user written texts have a " - " delimiter rather than the @runkeeper format
        let delimiter = trimmed.indexOf(" - ")

        if (delimiter == -1) {
            return "";
        }

        // Getting everything after " - "
        let user_comment = trimmed.substring(delimiter + 3).trim();
        if (user_comment === "" ||
            user_comment.toLowerCase() === "tomtom mysports watch" ||
            user_comment.toLowerCase() === "with @runkeeper. check it out!") {
            return "";
        }

        return user_comment;

    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}
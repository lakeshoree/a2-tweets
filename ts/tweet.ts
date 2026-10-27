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
        let words = this.text.split(" ");

        // Examine each word until we find a distance, then grab the next word which is activity
        for (let i = 0; i < words.length; i++) {
            if (words[i] === "km" || words[i] === "mi") {
                // Taking up to two words after the distnace to grab multiword activities too
                let activity = words.slice(i + 1, i + 3).join(" ");
                activity = activity.split(" -")[0];
                activity = activity.split(" with")[0];
                activity = activity.split(" in")[0];
                return activity.trim();
            }
        }

        // Check if the activities are measured by time
        if (this.text.startsWith("Just posted a ") || 
            this.text.startsWith("Just posted an ")) {

                let start = this.text.startsWith("Just posted an ") ? 15 : 14;
                let end = this.text.indexOf(" in ", start);

                if (end !== -1) {
                    return this.text.substring(start,end).trim();
                }
        }

        if (this.text.toLowerCase().startsWith("i just ran with")) {
            return "run";
        }

        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        let words = this.text.split(" ");
        
        for (let i = 0; i < words.length; i++) {
            if (words[i] === "km" || words[i] === "mi") {
                let distance = parseFloat(words[i-1]);
        

            if (isNaN(distance)) {
                return 0;
            }

            // If kilometers then convert to miles
            if (words[i] == "km") {
                return distance / 1.609;
            }

            return distance;

            }
        }

        // In the case that no distance is found
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        // Extracting the activity link from the original tweet
        let urlMatch = this.text.match(/https?:\/\/[^\s]+/);
        let url = urlMatch ? urlMatch[0] : "";

        // Escape special HTML characters in user-written text
        let safeText = this.writtenText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        // Create a clickable link if a URL exists
        let tweetContent = safeText;

        if (url !== "") {
            tweetContent += ` <a href="${url}" target="_blank" rel="noopener noreferrer">View activity</a>`;
        }

        // Return a complete HTML table row
        return `
            <tr>
                <td>${rowNumber}</td>
                <td>${this.activityType}</td>
                <td>${tweetContent}</td>
            </tr>
        `;

    }
}
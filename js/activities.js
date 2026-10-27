
function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    let tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // 2.1 Determining activity type and distance
    let activityCounts = {};

    for (let tweet of tweet_array) {
        if (tweet.source === "completed_event") {
            let activity = tweet.activityType;

            if (activity !== "unknown") {
                if (activityCounts[activity] === undefined) {
                    activityCounts[activity] = 0;
                }

                activityCounts[activity]++;
            }
        }
    }

    // Sort the activities from most to least common
    let sortedActivites = Object.entries(activityCounts).sort((a,b) => b[1] - a[1]);

    // Get the top 3 activities
    let topThreeActivities = sortedActivites.slice(0,3);
    console.log("Top three activities: ", topThreeActivities);

    // Calculate distance for each of the top 3 activities
    let averageDistances = {};

    for (let [activity, count] of topThreeActivities) {
        let distances = tweet_array.filter(tweet =>
            tweet.source === "completed_event" &&
            tweet.activityType === activity &&
            tweet.distance > 0
        ).map(tweet => tweet.distance);

        let totalDistance = distances.reduce((sum, distance) => sum + distance, 0);

        averageDistances[activity] = distances.length > 0
            ? totalDistance / distances.length
            : 0;
    }

    console.log("Average distances: ", averageDistances);

    let sortedByDistance = Object.entries(averageDistances).sort((a,b) => b[1] - a[1]);
    console.log("Longest average activity:", sortedByDistance[0]);
    console.log("Shortest average activity:", sortedByDistance[sortedByDistance.length - 1]);

    // Comparing weekdays vs weekends
    let weekdayDistances = [];
    let weekendDistances = [];

    for (let tweet of tweet_array) {
        if (tweet.source === "completed_event" &&
            tweet.distance > 0 &&
            topThreeActivities.some(item => item[0] === tweet.activityType)) {

            let day = tweet.time.getDay();

            if (day === 0 || day === 6) {
                weekendDistances.push(tweet.distance);
            } else {
                weekdayDistances.push(tweet.distance);
            }
        }
    }

    let weekdayAverage = weekdayDistances.length > 0
        ? weekdayDistances.reduce((sum, distance) => sum + distance, 0)
            / weekdayDistances.length
        : 0;

    let weekendAverage = weekendDistances.length > 0
        ? weekendDistances.reduce((sum, distance) => sum + distance, 0)
            / weekendDistances.length
        : 0;

    console.log("Weekday average:", weekdayAverage);
    console.log("Weekend average:", weekendAverage);

    // Displaying activity statistics on webpage
    document.getElementById('numberActivities').innerText = Object.keys(activityCounts).length;

    // The top 3 activities
    document.getElementById('firstMost').innerText = topThreeActivities[0]?.[0] ?? "unknown";
    document.getElementById('secondMost').innerText = topThreeActivities[1]?.[0] ?? "unknown";
    document.getElementById('thirdMost').innerText = topThreeActivities[2]?.[0] ?? "unknown";

    // Longest and shortest average distances
    document.getElementById('longestActivityType').innerText =
        sortedByDistance[0]?.[0] ?? "unknown";

    document.getElementById('shortestActivityType').innerText =
        sortedByDistance[sortedByDistance.length - 1]?.[0] ?? "unknown";

    // Weekday vs. Weekend
    document.getElementById('weekdayOrWeekendLonger').innerText =
        weekendAverage > weekdayAverage ? "weekends" : "weekdays";

	// 2.2: Graphing activities by distance
	
	// Graph 1: the number of activities that exist in the dataset
    let activityData = Object.entries(activityCounts).map(([activity, count]) => {
        return {
            activity: activity,
            count: count
        };
    });

    let activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A graph of the number of Tweets containing each type of activity.",
        "data": {
            "values": activityData
        },
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "activity",
                "type": "nominal",
                "sort": "-y",
                "title": "Activity Type"
            },
            "y": {
                "field": "count",
                "type": "quantitative",
                "title": "Number of Tweets"
            }
        },
        "width": 650,
        "height": 300
    };

    vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

    // Storing date visualizations in correct order
    let days = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    // Creating a new array containing activity, distance, and weekday
    let distanceData = tweet_array
        .filter(tweet =>
            tweet.source === "completed_event" &&
            tweet.distance > 0 &&
            topThreeActivities.some(item => item[0] === tweet.activityType)
        )
        .map(tweet => {
            return {
                activity: tweet.activityType,
                distance: tweet.distance,
                day: days[tweet.time.getDay()]
            };
        });


    // Graph 2: individual activity distances by day of the week
    let distance_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances for the three most popular activities by weekday.",
        "data": {
            "values": distanceData
        },
        "mark": {
            "type": "circle",
            "opacity": 0.3
        },
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "sort": days,
                "title": "Day of Week"
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance (Miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            }
        },
        "width": 650,
        "height": 350
    };

    vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});


    // Graph 3: average distances by day of the week
    let distance_aggregated_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean distances for the three most popular activities by weekday.",
        "data": {
            "values": distanceData
        },
        "mark": {
            "type": "line",
            "point": true
        },
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "sort": days,
                "title": "Day of Week"
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "aggregate": "mean",
                "title": "Average Distance (Miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            }
        },
        "width": 650,
        "height": 350
    };

    vegaEmbed('#distanceVisAggregated', distance_aggregated_spec, {actions:false});


    let aggregateButton = document.getElementById('aggregate');
    let individualGraph = document.getElementById('distanceVis');
    let aggregatedGraph = document.getElementById('distanceVisAggregated');

    aggregatedGraph.style.display = "none";

    aggregateButton.addEventListener('click', function() {
        if (aggregatedGraph.style.display === "none") {
            individualGraph.style.display = "none";
            aggregatedGraph.style.display = "block";
            aggregateButton.innerText = "Show individual distances";
        } else {
            individualGraph.style.display = "block";
            aggregatedGraph.style.display = "none";
            aggregateButton.innerText = "Show means";
        }
    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});

export function insertMessage(userId, exercise, scanResult) {
    const randomAffirmation = affirmations(Math.floor(Math.random() * 8))
    const slackMessage = {
        "response_type": "in_channel",
        "text": userId + " is now at " + sumItems(scanResult.Items) + " " + exercise + "! " + randomAffirmation,
        attachments: []
    };
    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

export function leaderboardMessage(scanResult, exercise) {
    var leaderboard = leaderboard_formatter(scanResult.Items)
    var pretty_print = leaderboard.map(item => ({ text: item.userId + ": " + item.amount }));

    const slackMessage = {
        "response_type": "in_channel",
        "text": "The " + exercise + " standings are:",
        attachments: pretty_print
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

export function legacyLeaderboardMessage(results, exercise) {
    const slackMessage = {
        "response_type": "in_channel",
        "text": "The " + exercise + " standings are:",
        attachments: results
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

export function errorMessage() {
    return {
        statusCode: 200,
        body: "Something went wrong."
    };
}

export function helpMessage() {
    const slackMessage = {
        "response_type": "in_channel",
        "text": "instructions",
        "attachments": [
            {
                "text": "This bot can track [p]ushups, [s]quats, and [c]hinups"
            },
            {
                "text": "`/fit {p,s,c} add <amount>` to add <amount> pushups, squats or chinups to your total"
            },
            {
                "text": "`/fit {p,s,c} {today, week, month, year}` to see the standings for a specified time period"
            },
            {
                "text": "`/fit {p,s,c} legacy <year>` to see the standings for the before times {2020-2022}"
            }
        ]
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

function affirmations(index) {
    return [
        "Get it girl!",
        "Great job!",
        "Keep it up!",
        ":muscle::muscle::muscle:",
        "I believe in you!",
        "More More More!",
        "You have pleased the robot",
        "You are amazing!"

    ][index]
}

function leaderboard_formatter(items) {
    var grouped_result = items.reduce(function (acc, item) {
        if (!acc[item.userId]) {
            acc[item.userId] = { userId: item.userId, amount: 0 };
        }
        acc[item.userId].amount += item.amount;
        return acc;
    }, {});

    return Object.values(grouped_result).sort((a, b) => b.amount - a.amount)
}

function sumItems(items) {
    return items.reduce((acc, x) => acc + x.amount, 0)
}
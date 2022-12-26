export function insertMessage(userId, exercise, scanResult) {
    const randomAffirmation = affirmations(Math.floor(Math.random() * 4))
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

export function leaderboardMessage(scanResult) {
    var leaderboard = leaderboard_formatter(scanResult.Items)
    var pretty_print = leaderboard.map(item => ({ text: item.userId + ": " + item.amount }));

    const slackMessage = {
        "response_type": "in_channel",
        "text": "The standings are:",
        attachments: pretty_print
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

function affirmations(index) {
    return [
        "Get it girl!",
        "Great job!",
        "Keep it up!",
        ":muscle::muscle::muscle:"
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
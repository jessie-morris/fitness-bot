import * as db from '../db.mjs'
import * as messages from '../messages.mjs'

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

//My imports
import queryString from 'querystring';

export const putItemHandler = async (event) => {
    const params = queryString.parse(event.body);
    console.dir(params)

    const userId = params.user_name;

    let action, amount;
    [action, amount] = params.text.split(" ");

    try {
        switch (action) {
            case "add":
                const data = await db.insertExercise(userId, amount);
                var scanResult = await db.getUserTotal(userId)
                return messages.insertMessage(userId, scanResult)
                break;
            case "leaderboard":
                var scanResult = await db.getLeaderboard()
                return messages.leaderboardMessage(scanResult)
                break;
            case "today":
                var scanResult = await db.getDailyPushups()
                return messages.leaderboardMessage(scanResult)
                break;
            case "month":
                var scanResult = await db.getMonthlyPushups()
                return messages.leaderboardMessage(scanResult)
                break;
        }
    } catch (err) {
        console.log("Error", err.stack);
        return messages.errorMessage()
    }

    return messages.errorMessage()
}
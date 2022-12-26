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

    let action, exercise, amount;
    [exercise, action, amount] = params.text.split(" ");
    exercise = translate_exercise(exercise)
    console.log("exercise after", exercise)

    try {
        switch (action) {
            case "add":
                const data = await db.insertExercise(userId, exercise, amount);
                var scanResult = await db.getUserTotal(userId, exercise)
                return messages.insertMessage(userId, exercise, scanResult)
                break;
            case "year":
                var scanResult = await db.getYearlyReps(exercise)
                return messages.leaderboardMessage(scanResult)
                break;
            case "today":
                var scanResult = await db.getDailyReps(exercise)
                return messages.leaderboardMessage(scanResult)
                break;
            case "month":
                var scanResult = await db.getMonthlyReps(exercise)
                return messages.leaderboardMessage(scanResult)
                break;
            case "week":
                var scanResult = await db.getWeeklyReps(exercise)
                return messages.leaderboardMessage(scanResult)
                break;
            default:
                console.log("did i make ithere???")
                return messages.helpMessage()
                break;
        }
    } catch (err) {
        console.log("Error", err.stack);
        return messages.errorMessage()
    }

    return messages.errorMessage()
}

function translate_exercise(exercise) {
    exercise = exercise.toLowerCase().trim();
    console.log("exercise before ", exercise)
    switch (exercise) {
        case "p":
        case "pushups":
        case "pushup":
            return "pushups"
            break;
        case "s":
        case "squat":
        case "squats":
            return "squats"
            break;
        case "c":
        case "chinup":
        case "chinups":
            return "chinups"
            break;
        default:
            return "help"
            break;
    }
}
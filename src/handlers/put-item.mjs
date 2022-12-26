import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as db from '../db.mjs'
import * as messages from '../messages.mjs'

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

//My imports
import queryString from 'querystring';

export const putItemHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    const params = queryString.parse(event.body);
    console.dir(params)

    const userId = params.user_name;
    const command = params.text;
    const command_parts = command.split(" ");

    let action, amount;
    [action, amount] = command_parts

    try {
        switch (action) {
            case "add":
                const data = await db.insertExercise(userId, amount);
                var scanResult = await db.getUserTotal(userId)
                return messages.insertMessage(userId, scanResult)
                break;
            case "leaderboard":
                var scanResult = await getLeaderboard()
                return messages.leaderboardMessage(scanResult)
                break;
            case "today":
                var scanResult = await getDailyPushups()
                return messages.leaderboardMessage(scanResult)
                break;
            case "month":
                var scanResult = await getMonthlyPushups()
                return messages.leaderboardMessage(scanResult)
                break;
        }
    } catch (err) {
        console.log("Error", err.stack);
        return messages.errorMessage()
    }

    return messages.errorMessage()
}


function sumItems(items) {
    return items.reduce((acc, x) => acc + x.amount, 0)
}

async function getLeaderboard() {
    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': "pushups",
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));

}

async function getDailyPushups() {
    var today = new Date().toLocaleDateString('en-ZA', { timeZone: "America/New_York" })
    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': "pushups",
            ':today': today
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :today',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));
}

async function getMonthlyPushups() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    var formattedDate = firstDay.toLocaleDateString('en-ZA', { timeZone: "America/New_York" })

    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': "pushups",
            ':firstOfMonth': formattedDate
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :firstOfMonth',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));
}
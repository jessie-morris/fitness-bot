import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as db from '../db.mjs'

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

    switch(action) {
        case "add":
            try {
                const data = await db.insertExercise(userId, amount);
                var scanResult = await db.getUserTotal(userId)
                return insertMessage(userId, scanResult)
            } catch (err) {
                console.log("Error", err.stack);
                return errorMessage()
            }
            break;
        case "leaderboard":
            try {
                var scanResult = await getLeaderboard()
                return leaderboardMessage(scanResult)
            } catch (err) {
                console.log("Error", err.stack);
                return errorMessage()
            }
            break;
        case "today":
            try {
                var scanResult = await getDailyPushups()
                return leaderboardMessage(scanResult)
            } catch (err) {
                console.log("Error", err.stack);
                return errorMessage()
            }
        case "month":
            try {
                var scanResult = await getMonthlyPushups()
                return leaderboardMessage(scanResult)
            } catch (err) {
                console.log("Error", err.stack);
                return errorMessage()
            }
    }

    return errorMessage()
};

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
    var today = new Date().toLocaleDateString('en-ZA', {timeZone: "America/New_York"})
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
    var formattedDate = firstDay.toLocaleDateString('en-ZA', {timeZone: "America/New_York"})

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

function insertMessage(userId, scanResult) {
    const slackMessage = {
        "response_type": "in_channel",
        "text": userId + " is now at " + sumItems(scanResult.Items) + " pushups!  Get it girl!",
        attachments: []
    };
    console.log("are we outsiiiide")
    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

function leaderboardMessage(scanResult) {
    var leaderboard = leaderboard_formatter(scanResult.Items)
    var pretty_print = leaderboard.map(item => ({ text: item.userId + ": " + item.amount }));

    const slackMessage = {
        "response_type": "in_channel",
        "text": "The standings are",
        attachments: pretty_print
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };
    return response;
}

function errorMessage() {
    return {
        statusCode: 200,
        body: "Something went wrong."
    };
}

function group_by_userId(items) {
    return items.reduce((acc, obj) => {
       const key = obj["userId"];
       if (!acc[key]) {
          acc[key] = 0;
       }
        acc[key] = acc[key] + obj.amount;
       return acc;
    }, {});
 }

 function leaderboard_formatter(items) {
    var grouped_result = items.reduce(function(acc, item) {
        if (!acc[item.userId]) {
          acc[item.userId] = { userId: item.userId, amount: 0 };
        }
        acc[item.userId].amount += item.amount;
        return acc;
      }, {});

      return Object.values(grouped_result).sort((a,b) => b.amount - a.amount)
 }
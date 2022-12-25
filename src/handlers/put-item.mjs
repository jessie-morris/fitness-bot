// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

//My imports
import queryString from 'querystring';
import crypto from 'crypto'

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
                const data = await insertExercise(userId, amount);
                var scanResult = await getUserTotal(userId)
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
    // console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
};

function sumItems(items) {
    return items.reduce((acc, x) => acc + x.amount, 0)
}

async function insertExercise(userId, amount) {
    var dataParams = {
        TableName : tableName,
        Item: {
            id: crypto.randomUUID().toString(),
            userId : userId,
            exercise: "pushups",
            amount: parseInt(amount),
            insertedAt: new Date().toLocaleDateString('en-ZA', {timeZone: "America/New_York"})
        }
    };
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    return await ddbDocClient.send(new PutCommand(dataParams));
}

async function getUserTotal(userId) {
    var scanParams = {
        ExpressionAttributeValues: {
          ':username': userId,
          ':exercise': "pushups",
        },
        ProjectionExpression: 'amount',
        FilterExpression: 'userId = :username and exercise = :exercise',
        TableName: tableName
      };

      return await ddbDocClient.send(new ScanCommand(scanParams));

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
    var leaderboard = group_by_userId(scanResult.Items)

    const slackMessage = {
        "response_type": "in_channel",
        "text": JSON.stringify(leaderboard),
        attachments: []
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
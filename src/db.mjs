import crypto from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.EXERCISE_TABLE;

export async function insertExercise(userId, exercise, amount) {
    var dataParams = {
        TableName : tableName,
        Item: {
            id: crypto.randomUUID().toString(),
            userId : userId,
            exercise: exercise,
            amount: parseInt(amount),
            insertedAt: new Date().toLocaleDateString('en-ZA', {timeZone: "America/New_York"})
        }
    };
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    return await ddbDocClient.send(new PutCommand(dataParams));
}

export async function getUserTotal(userId, exercise) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    var formattedDate = firstDay.toLocaleDateString('en-ZA')

    var scanParams = {
        ExpressionAttributeValues: {
          ':username': userId,
          ':exercise': exercise,
          ':thisYear': formattedDate
        },
        ProjectionExpression: 'amount',
        FilterExpression: 'userId = :username and exercise = :exercise and insertedAt >= :thisYear',
        TableName: tableName
      };

      return await ddbDocClient.send(new ScanCommand(scanParams));

}


export async function getYearlyReps(exercise) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    var formattedDate = firstDay.toLocaleDateString('en-ZA')

    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': exercise,
            ':thisYear': formattedDate
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :thisYear',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));

}

export async function getDailyReps(exercise) {
    var today = new Date().toLocaleDateString('en-ZA', { timeZone: "America/New_York" })
    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': exercise,
            ':today': today
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :today',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));
}

export async function getMonthlyReps(exercise) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    var formattedDate = firstDay.toLocaleDateString('en-ZA', { timeZone: "America/New_York" })

    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': exercise,
            ':firstOfMonth': formattedDate
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :firstOfMonth',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));
}


export async function getWeeklyReps(exercise) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    var formattedDate = firstDay.toLocaleDateString('en-ZA', { timeZone: "America/New_York" })
    var scanParams = {
        ExpressionAttributeValues: {
            ':exercise': exercise,
            ':firstOfMonth': formattedDate
        },
        ProjectionExpression: 'userId, amount',
        FilterExpression: 'exercise = :exercise and insertedAt >= :firstOfMonth',
        TableName: tableName
    };

    return await ddbDocClient.send(new ScanCommand(scanParams));
}
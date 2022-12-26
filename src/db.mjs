// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;
import crypto from 'crypto'

export async function insertExercise(userId, amount) {
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

export async function getUserTotal(userId) {
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
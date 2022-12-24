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

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    const params = queryString.parse(event.body);
    console.dir(event);

    console.dir(params)

    const userId = params.user_name;
    const command = params.text;
    const command_parts = command.split(" ");

    let action, amount;
    [action, amount] = command_parts

    switch(action) {
        case "add":
            // Creates a new item, or replaces an old item with a new item
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
            var dataParams = {
                TableName : tableName,
                Item: {
                    id: crypto.randomUUID().toString(),
                    userId : userId,
                    exercise: "pushups",
                    amount: parseInt(amount),
                    insertedAt: new Date().toLocaleDateString()}
            };

            try {
                const data = await ddbDocClient.send(new PutCommand(dataParams));
                console.log("Success - item added or updated", data);

                var scanParams = {
                    ExpressionAttributeValues: {
                      ':username': userId,
                      ':exercise': "pushups",
                    },
                    // KeyConditionExpression: 'userId = :username',
                    ProjectionExpression: 'amount',
                    FilterExpression: 'userId = :username and exercise = :exercise',
                    TableName: tableName
                  };

                  var scanResult = await ddbDocClient.send(new ScanCommand(scanParams));
                  console.log("RESULTS OF THE SCAN", scanResult)

            } catch (err) {
                console.log("Error", err.stack);

                return {
                    statusCode: 200,
                    body: "Something went wrong."
                };
            }
            break;
    }

    const slackMessage = {
        "response_type": "in_channel",
        "text": userId + " is now at " + sumItems(scanResult.Items) + " pushups!  Get it girl!",
        attachments: []
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(slackMessage)
    };

    return response


    // All log statements are written to CloudWatch
    // console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);

};

function sumItems(items) {
    return items.reduce((acc, x) => acc + x.amount, 0)
}

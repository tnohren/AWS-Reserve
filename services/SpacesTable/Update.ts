import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getEventBody } from "../Shared/Utility";

// Get Necessary Global Variables
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

// Create DB Client
const dbClient = new DynamoDB.DocumentClient();

// Handle Request
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    try {
        // Get Request Body and Primary Key Value
        const requestBody = getEventBody(event);
        const spaceId = event.queryStringParameters?.[PRIMARY_KEY!]; // ?. only get if object exists

        // Build and send update request
        if (requestBody && spaceId) {
            const requestKey = Object.keys(requestBody)[0];
            const requestValue = requestBody[requestKey];
        
            const updateResult = await dbClient.update({
                TableName: TABLE_NAME!,
                Key: {
                    [PRIMARY_KEY!]: spaceId
                },
                UpdateExpression: 'set #zzzNew = :new',
                ExpressionAttributeNames: {
                    '#zzzNew': requestKey
                },
                ExpressionAttributeValues: {
                    ':new': requestValue
                },
                ReturnValues: 'UPDATED_NEW'
            }).promise();

            result.body = JSON.stringify(updateResult);
        }
    }
    catch (error) {
        result.statusCode = 403;
        result.body = String(error);
    }

    return result;
}

export {handler}
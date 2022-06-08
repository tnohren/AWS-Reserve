import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Get Necessary Global Variables
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

// Create DB Client
const dbClient = new DynamoDB.DocumentClient();

// Handle Delete Request
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    // Get Primary Key Value
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY!]; // ?. only get if object exists

    // Build and send delete request
    if (spaceId) {
        const deleteResult = await dbClient.delete({
            TableName: TABLE_NAME!,
            Key: {
                [PRIMARY_KEY!]: spaceId
            }
        }).promise();

        result.body = JSON.stringify(deleteResult);
    }

    return result;
}

export {handler}
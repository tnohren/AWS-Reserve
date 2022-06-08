import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { MissingFieldError, validateSpace } from '../Shared/InputValidation';
import { generateRandomId, getEventBody } from '../Shared/Utility';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DynamoDB'
    }

    try {
        // Create and validate new item
        const item = getEventBody(event);
        item.spaceId = generateRandomId();
        validateSpace(item);

        // Send Put Request
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise();

        result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);
    } catch (error) {
        if (error instanceof MissingFieldError) {
            result.statusCode = 403;
        }
        else {
            result.statusCode = 500;
        }
        result.body = "Received an error";
    }

    return result;
}

export {handler}
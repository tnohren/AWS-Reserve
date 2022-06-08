import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult, Context } from 'aws-lambda';

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
        if (event.queryStringParameters) {
            if (PRIMARY_KEY! in event.queryStringParameters) {
                result.body = await primaryQuery(event.queryStringParameters);
            }
            else {
                result.body = await secondaryQuery(event.queryStringParameters);
            }
        }
        else {
            result.body = await scanTable();
        }
    } catch (error) {
        result.body = String(error);
    }

    return result;
}

async function secondaryQuery(params: APIGatewayProxyEventQueryStringParameters) {
    const queryParameter = Object.keys(params)[0];
    const queryValue = params[queryParameter];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        IndexName: queryParameter, // Necessary for secondary index query
        KeyConditionExpression: '#zz = :zzzz',
        ExpressionAttributeNames: {
            '#zz': queryParameter
        },
        ExpressionAttributeValues: {
            ':zzzz': queryValue
        }
    }).promise();

    return JSON.stringify(queryResponse.Items);
}

async function primaryQuery(params: APIGatewayProxyEventQueryStringParameters) {
    const primaryParameter = params[PRIMARY_KEY!];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        KeyConditionExpression: '#zz = :zzzz',
        ExpressionAttributeNames: {
            '#zz': PRIMARY_KEY!
        },
        ExpressionAttributeValues: {
            ':zzzz': primaryParameter
        }
    }).promise();

    return JSON.stringify(queryResponse.Items);
}

async function scanTable() {
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME!
    }).promise();
    return JSON.stringify(queryResponse.Items);
}

export {handler}
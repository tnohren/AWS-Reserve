import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Delete';

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: "bd19341f-0e5f-4c15-91fb-a55931d76eb3"
    }
} as any;

const result = handler(event, {} as any).then((apiResult) => {
    const items = JSON.parse(apiResult.body);
    console.log(123);
});
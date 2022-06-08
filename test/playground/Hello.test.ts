import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Read';

const event: APIGatewayProxyEvent = {
    queryStringParameters: {
        spaceId: "e6c6b1b1-394b-4bde-b94d-48b41b5e55f4"
    }
} as any;

//const result = await handler({} as any, {} as any);
const result2 = handler(event, {} as any).then((apiResult) => {
    const items = JSON.parse(apiResult.body);
    console.log(123);
});
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {v4} from 'uuid';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { postSpaceHandler } from "./post-space-handler";
import { getSpaceHandler } from "./get-all-space-handler";
const ddbClient = new DynamoDBClient({});

async function handler(event:APIGatewayProxyEvent,context: Context):Promise<APIGatewayProxyResult>{
    
    let response: APIGatewayProxyResult;
    let message;
    try{
        switch(event.httpMethod){
            case 'GET':
                response = await getSpaceHandler(event,ddbClient);
                break;
            case 'POST':
                response =await postSpaceHandler(event,ddbClient);
                break;
            default:
                response={
                    statusCode: 404,
                    body: JSON.stringify('Method is not supported')
                }
                break;
        }
    }catch(ex:any){
        response={
            statusCode: 500,
            body: JSON.stringify(ex.message)
        }
    }

    return response;
}
export {handler};
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {v4} from 'uuid';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { postSpaceHandler } from "./post-space-handler";
import { getSpaceHandler } from "./get-all-space-handler";
import { captureAWSv3Client, getSegment } from "aws-xray-sdk-core";
//const ddbClient = new DynamoDBClient({});
const ddbClient = captureAWSv3Client(new DynamoDBClient({}));

async function handler(event:APIGatewayProxyEvent,context: Context):Promise<APIGatewayProxyResult>{
    
    let response: APIGatewayProxyResult;

    const subSeg = getSegment()?.addNewSubsegment('MyLongCall')
    await new Promise(resolve =>{ setTimeout(resolve, 3000)});
    subSeg?.close();

    const subSeg2 = getSegment()?.addNewSubsegment('MySHortCall')
    await new Promise(resolve =>{ setTimeout(resolve, 500)})
    subSeg2?.close();
    
    let message;
    try{
        switch(event.httpMethod){
            case 'GET':
                response = await getSpaceHandler(event,ddbClient);
                break;
            case 'POST':
                response =await postSpaceHandler(event,ddbClient);
                break;
            case 'PUT':
                response={
                    statusCode: 404,
                    body: JSON.stringify('PUT Method is not supported')
                }
                break;
            case 'PATCH':
                    response={
                        statusCode: 404,
                        body: JSON.stringify('PATCH Method is not supported')
                    }
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
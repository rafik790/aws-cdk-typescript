import {APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {v4} from 'uuid';
import {S3Client,ListBucketsCommand} from '@aws-sdk/client-s3';
const s3Clinet = new S3Client();
async function handler(event:APIGatewayProxyEvent,context: Context):Promise<APIGatewayProxyResult>{
    const command = new ListBucketsCommand({});
    const bucketList = (await s3Clinet.send(command)).Buckets;
    let message:string='';
    switch(event.httpMethod){
        case 'GET':
            message='Hello from GET!';
            break;
        case 'POST':
            message='Hello from POST';
            break;
        default:
            break;
    }

    const response:APIGatewayProxyResult ={
        statusCode: 200,
        body: JSON.stringify(message)
    }
    console.log(event);
    return response;
}
export {handler};
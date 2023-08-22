import {APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {v4} from 'uuid';
import {S3Client,ListBucketsCommand} from '@aws-sdk/client-s3';
const s3Clinet = new S3Client();
async function handler(event:APIGatewayProxyEvent,context: Context):Promise<APIGatewayProxyResult>{
    let response: APIGatewayProxyResult;
    try{
        const command = new ListBucketsCommand({});
        const bucketList = (await s3Clinet.send(command)).Buckets;
        const bucketNameList:any = [];
        bucketList?.forEach((bucket:any)=>{
            bucketNameList.push(bucket.bucketName)
        });
        
        let names = bucketNameList.join(",");
        let message:string='';
        switch(event.httpMethod){
            case 'GET':
                message=`Hello from GET! ${names}`;
                break;
            case 'POST':
                message='Hello from POST';
                break;
            default:
                break;
        }

        response={
            statusCode: 200,
            body: JSON.stringify(message)
        }
        console.log(event);
    }catch(ex){
        response={
            statusCode: 500,
            body: JSON.stringify(ex.message)
        }
    }

    return response;
}
export {handler};
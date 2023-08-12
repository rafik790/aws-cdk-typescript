import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";

export async function getSpaceHandler(event:APIGatewayProxyEvent,ddbClient: DynamoDBClient):Promise<APIGatewayProxyResult>{
    
    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME
    }));

    console.log(result);
    return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
    };
    
}
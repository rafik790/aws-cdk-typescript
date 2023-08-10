import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lbd from 'aws-cdk-lib/aws-lambda';
import {join} from 'path';
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
interface LambdaStackProps extends StackProps{
    spacesTable: ITable
}
export class LambdaStack extends Stack{
    public readonly helloLambdaIntegration: LambdaIntegration;
    constructor(scope:Construct,id:string,props:LambdaStackProps){
        super(scope,id,props);
        const helloLambda = new lbd.Function(this,"HelloLambda",{
            runtime: lbd.Runtime.NODEJS_18_X,
            handler: 'hello-lambda.main',
            code: lbd.Code.fromAsset(join(__dirname,'..','..','services')),
            environment: {
                TABLE_NAME: props.spacesTable.tableName
            }

        });
        this.helloLambdaIntegration= new LambdaIntegration(helloLambda);       
    }
}
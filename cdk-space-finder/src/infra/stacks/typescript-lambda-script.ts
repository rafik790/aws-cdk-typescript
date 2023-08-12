import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {join} from 'path';
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends StackProps{
    spacesTable: ITable
}

export class TypescriptLambdaStack extends Stack{
    public readonly helloIntegration: LambdaIntegration;
    public readonly spaceIntegration: LambdaIntegration;
    constructor(scope:Construct,id:string,props:LambdaStackProps){
        super(scope,id,props);
        //CODE FOR HELLO LAMBDA
        const helloLambda = new NodejsFunction(this,"HelloLambda",{
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: join(__dirname,'..','..','services','hello-typescript.ts'),
            environment: {
                TABLE_NAME: props.spacesTable.tableName
            }

        });
        
        helloLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions:[
                's3:ListAllMyBuckets',
                's3:ListBucket'
            ],
            resources:["*"]
        }))
        this.helloIntegration = new LambdaIntegration(helloLambda);   
        
        //CODE FOR SPACE LAMBDA
        const spaceLambda = new NodejsFunction(this,"SpaceLambda",{
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: join(__dirname,'..','..','services','spaces','space-lambda.ts'),
            environment: {
                TABLE_NAME: props.spacesTable.tableName
            }

        });
        
        spaceLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources:[ props.spacesTable.tableArn],
            actions:[
                'dynamodb:PutItem',
                'dynamodb:Scan'
            ]
        }));
        this.spaceIntegration = new LambdaIntegration(spaceLambda);   
        
        
    }
}
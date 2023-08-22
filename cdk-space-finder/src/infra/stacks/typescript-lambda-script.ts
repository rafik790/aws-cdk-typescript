import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {join} from 'path';
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
interface LambdaStackProps extends StackProps{
    spacesTable: ITable;
    vpc:ec2.Vpc;
}

export class TypescriptLambdaStack extends Stack{
    public readonly helloIntegration: LambdaIntegration;
    public readonly spaceIntegration: LambdaIntegration;
    constructor(scope:Construct,id:string,props:LambdaStackProps){
        super(scope,id,props);
        const subnets = props.vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE_ISOLATED}).subnets;
       
        //CODE FOR HELLO LAMBDA
        const helloLambda = new NodejsFunction(this,"HelloLambda",{
            vpc: props.vpc,
            vpcSubnets:  { subnets: subnets},
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
            vpc: props.vpc,
            vpcSubnets:  { subnets: subnets},
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: join(__dirname,'..','..','services','spaces','space-lambda.ts'),
            environment: {
                TABLE_NAME: props.spacesTable.tableName
            },
            tracing: Tracing.ACTIVE,
            timeout: Duration.minutes(1)
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
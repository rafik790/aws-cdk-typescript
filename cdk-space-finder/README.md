# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

This application will create one APIGateway, which will connect to Lambda and Lambda will access DynamoDB
- API gateway
- Lambda 
- DynamoDB

We have one lambd build using javascript and another with typecript.
- To usig typescript lambda we need to do following
- npm i -D @types/aws-lambda
- npm i uuid @types/uuid 
- npm i -D esbuild
- user NodejsFunction construct from aws-cdk-lib/aws-lambda-nodejs to create lambda stack

## Now if we want to acess aws resources from lambda we need to use AWS SDK
- AWS-SDK - Library that assits accessing AWS resources
- AWS SDK (JS) was monolith
    - All services were packed into the same library
AWS SDK v3: Breaked by services
- async and Typescript support
- systex: client and command architecture

## CDK in past (v1):
 - broken into different services
## CDK now
 - monolith

## our hello-typescript lambda access s3 bucket to list all the bucket. We need to do following
- npm i -D @aws-sdk/client-s3
- import {S3Client,ListBucketsCommand} from '@aws-sdk/client-s3';
- Lambda need permission to access S3 for this we have to modify and add addToRolePolicy in typescript-lambda-script construct

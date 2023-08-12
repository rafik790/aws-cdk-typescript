import { App } from "aws-cdk-lib";
import { DataStack } from "./stacks/data-stack";
import { LambdaStack } from "./stacks/lambda-stack";
import { ApiStack } from "./stacks/api-stack";
import { TypescriptLambdaStack } from "./stacks/typescript-lambda-script";

const app = new App();
const dataStack = new DataStack(app,"DataStack");

/*
const lambdaStack = new LambdaStack(app,"LambdaStack",{
    spacesTable: dataStack.spacesTable
});*/

const lambdaStack = new TypescriptLambdaStack(app,"LambdaStack",{
    spacesTable: dataStack.spacesTable
});

new ApiStack(app,"ApiStack",{
    helloLambdaIntegration: lambdaStack.helloIntegration,
    spaceLambdaIntegration: lambdaStack.spaceIntegration
});


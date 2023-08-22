import { App } from "aws-cdk-lib";
import { DataStack } from "./stacks/data-stack";
import { LambdaStack } from "./stacks/lambda-stack";
import { ApiStack } from "./stacks/api-stack";
import { TypescriptLambdaStack } from "./stacks/typescript-lambda-script";
import { MonitorStack } from "./stacks/monitor-stack";
import { VpcStack } from "./stacks/vpc-stack";
import { Ec2InstaceStack } from "./stacks/ec2-instance-stack";

const app = new App();
const vpcStack = new VpcStack(app,"VpcStack");
const dataStack = new DataStack(app,"DataStack");

const ecInstaceStack = new Ec2InstaceStack(app,"Ec2Instace",{
    vpc: vpcStack.vpc
});


const lambdaStack = new TypescriptLambdaStack(app,"LambdaStack",{
    spacesTable: dataStack.spacesTable,
    vpc: vpcStack.vpc
});

new ApiStack(app,"ApiStack",{
    helloLambdaIntegration: lambdaStack.helloIntegration,
    spaceLambdaIntegration: lambdaStack.spaceIntegration
});

const monitor = new MonitorStack(app,"MonitorStack",{
    spacesTable: dataStack.spacesTable
});

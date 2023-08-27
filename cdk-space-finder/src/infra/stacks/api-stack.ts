import { Stack, StackProps } from "aws-cdk-lib";
import { EndpointType, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
interface ApiStackProps extends StackProps{
    helloLambdaIntegration: LambdaIntegration
    spaceLambdaIntegration: LambdaIntegration
}
export class ApiStack extends Stack{
    constructor(scope:Construct,id:string,props:ApiStackProps){
        super(scope,id,props);
        
        const api = new RestApi(this,"SpacesApi");
        const helloResource = api.root.addResource('hello');
        helloResource.addMethod("GET",props.helloLambdaIntegration);
        helloResource.addMethod('POST',props.helloLambdaIntegration);

        const spaceResource = api.root.addResource('spaces');
        spaceResource.addMethod("GET",props.spaceLambdaIntegration);
        spaceResource.addMethod('POST',props.spaceLambdaIntegration);
        spaceResource.addMethod('PUT',props.spaceLambdaIntegration);
        spaceResource.addMethod('PATCH',props.spaceLambdaIntegration);
    }
}
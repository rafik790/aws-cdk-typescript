import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
interface PhotosHandlerStackProps extends cdk.StackProps{
    targetBucketArn:string
}
export class PhotosHandlerStack extends cdk.Stack {
   
    constructor(scope: Construct, id: string, props: PhotosHandlerStackProps) {
        super(scope,id);
        //const targetBucket = cdk.Fn.importValue('photo-bucket');
        new lambda.Function(this,'PhotoHandler',{
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
                exports.handler = async (event)=>{
                    console.log("Hello! :"+ process.env.TARGET_BUCKET);
                };
            `),
            environment:{
                TARGET_BUCKET: props.targetBucketArn
            },
        })
    }
}
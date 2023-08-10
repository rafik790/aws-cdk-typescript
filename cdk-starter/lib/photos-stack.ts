import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class PhotosStack extends cdk.Stack {
    private suffix:String;
    public readonly photoBucketArn:string;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope,id);
        this.initSuffix();

        const photobucket = new s3.Bucket(this, 'MyL2Bucket', {
            bucketName:`photos-${this.suffix}`
        });

        new cdk.CfnOutput(this,'photo-bucket',{
            value: photobucket.bucketArn,
            exportName:'photo-bucket'
        });
        this.photoBucketArn = photobucket.bucketArn;
    }
    
    private initSuffix(){
        const shortStatckId = cdk.Fn.select(2,cdk.Fn.split('/',this.stackId));
        this.suffix = cdk.Fn.select(4,cdk.Fn.split('-',shortStatckId));
    }
}
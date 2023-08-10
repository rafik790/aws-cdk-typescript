import { App, CfnOutput, CfnParameter, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

class MyL3BucketConstruck extends Construct{
  constructor(scope: Construct,id:string,duration:number){
    super(scope,id);
    new s3.Bucket(this, 'L3Bucket', {
      versioned: true,
      lifecycleRules:[{
        expiration: Duration.days(duration)
      }]
    });
  }
}

export class CdkStarterStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.CfnBucket(this,"MyL1Bucket",{
      lifecycleConfiguration:{
        rules:[{
          expirationInDays:1,
          status:'Enabled'
        }]
      }
    })

    const duration = new CfnParameter(this,"duration",{
      default:6,
      minValue: 1,
      maxValue: 10,
      type:'Number'
    });

    const myL2Bucket = new s3.Bucket(this, 'MyL2Bucket', {
      versioned: true,
      lifecycleRules:[{
        expiration: Duration.days(duration.valueAsNumber)
      }]
    });
    
    new CfnOutput(this,"MyL2BucketName",{
      value: myL2Bucket.bucketName
    });

    new MyL3BucketConstruck(this,'MyL3Bucket',1);
  }
}
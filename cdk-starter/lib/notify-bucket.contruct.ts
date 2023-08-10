import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3notify from 'aws-cdk-lib/aws-s3-notifications';

export interface NotifyingBucketProps {
    prefix?: string;
}
  
export class NotifyingBucket extends Construct {
    constructor(scope: Construct, id: string, props: NotifyingBucketProps = {}) {
      super(scope, id);
      const bucket = new s3.Bucket(this, 'bucket');
      const topic = new sns.Topic(this, 'topic');

      bucket.addObjectCreatedNotification(new s3notify.SnsDestination(topic),
        { prefix: props.prefix }
      );
    }
  }
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Alarm, Metric, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { join } from "path";
interface MonitorStackProps extends StackProps{
    spacesTable: dynamodb.ITable;

}

export class MonitorStack extends Stack{
    constructor(scope:Construct,id:string,props:MonitorStackProps){
        super(scope,id,props);

        const webHookLambda = new NodejsFunction(this, 'webHookLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..', 'services', 'monitor', 'alarm-lambda.ts'))
        });
        
        const alarmTopic = new Topic(this, 'AlarmTopic', {
            displayName: 'AlarmTopic',
            topicName: 'AlarmTopic'
        });
        alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));
        const topicAction = new SnsAction(alarmTopic);

        const spaceApi4xxAlarm = new Alarm(this,'spaceApi4xxAlarm',{
            metric: new Metric({
                metricName:'4XXError',
                namespace:'AWS/ApiGateway',
                statistic:'Sum',
                period: Duration.minutes(1),
                unit: Unit.COUNT,
                dimensionsMap:{
                    'ApiName':'SpacesApi'
                }
            }),
            evaluationPeriods:1,
            threshold: 5,
            alarmName:'SpaceApi4xxAlarm'
        });
        
        
        spaceApi4xxAlarm.addAlarmAction(topicAction);
        spaceApi4xxAlarm.addOkAction(topicAction);

        //const dbMetric = props.spacesTable.metricThrottledRequestsForOperations({
        //    operations: [dynamodb.Operation.PUT_ITEM],
         //   period: Duration.minutes(1),
        //});


        const dynamodbPutAlarm = new Alarm(this, 'DbPutItrmAlarm', {
            metric: new Metric({
                metricName:"SuccessfulRequestLatency",
                namespace:"AWS/DynamoDB",
                statistic:"Sum",
                period:Duration.minutes(1),
                unit: Unit.COUNT,
                dimensionsMap:{
                    "TableName": props.spacesTable.tableName,
                    "Operation": "PutItem"
                }
            }),
            evaluationPeriods: 1,
            threshold: 5,
            alarmName:'DbPutItrmAlarm'
        });
        dynamodbPutAlarm.addAlarmAction(topicAction);
        dynamodbPutAlarm.addOkAction(topicAction);

    }
}
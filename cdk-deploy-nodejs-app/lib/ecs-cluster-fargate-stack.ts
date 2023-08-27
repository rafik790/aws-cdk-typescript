import { Fn, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface EcsClusterFargateStackProps extends StackProps{
    vpc: ec2.Vpc
}
export class EcsClusterFargateStack extends Stack{
    constructor(scope:Construct,id:string,props: EcsClusterFargateStackProps){
        super(scope,id);
        const subnets = props.vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC}).subnets;
        const suffix = this.getSuffixFromStack(this);

        //const kmsEncryptionKey = new kms.Key(this, 'CdkEcsKmsKey',{
        //  alias:`cdk-ecs-key-${suffix}`,
        //});

        const logGroup = new logs.LogGroup(this, 'CdkEcsLogGroup', {
          logGroupName:`cdk-ecs-log-group-${suffix}`,
          retention: logs.RetentionDays.ONE_WEEK,
        });

        const execBucket = new s3.Bucket(this, 'CdkEcsExecBucket', {
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          bucketName:`cdk-ecs-log-store-${suffix}`
        });


        const cdkFargetCluster = new ecs.Cluster(this, 'CdkEcsFargetCluster', { 
            vpc: props.vpc,
            clusterName: `cdk-ecs-fargate-cluster-${suffix}`,
            executeCommandConfiguration:{
              //kmsKey: kmsEncryptionKey,
              logConfiguration:{
                cloudWatchLogGroup: logGroup,
                cloudWatchEncryptionEnabled: true,
                s3Bucket: execBucket,
                s3EncryptionEnabled: true,
                s3KeyPrefix: 'exec-command-output',
              },
              logging: ecs.ExecuteCommandLogging.OVERRIDE
            }
        });
       
        const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'CdkEcsTaskDef', {
            memoryLimitMiB: 1024,
            cpu: 256,
          });

          const container = fargateTaskDefinition.addContainer("WebContainer", {
            image: ecs.ContainerImage.fromRegistry("rafik790/libanto-purchases")
          });
          
          container.addPortMappings({
            containerPort: 8091,
          });
          
          const sgForLB = new ec2.SecurityGroup(this,"cdk-ecs-alb-sg",{
            vpc: props.vpc,
            allowAllOutbound: true,
            disableInlineRules: false,
            securityGroupName:`cdk-ecs-alb-sg-${suffix}`
         });
         sgForLB.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow http request from all address');


         const sgForService = new ec2.SecurityGroup(this,"cdk-ecs-service-sg",{
            vpc: props.vpc,
            allowAllOutbound: true,
            disableInlineRules: false,
            securityGroupName:`cdk-ecs-service-sg-${suffix}`
         });
         sgForService.addIngressRule(sgForLB, ec2.Port.tcp(8091), 'allow access from security group');

          const service = new ecs.FargateService(this, 'Service', {
            serviceName:`cdk-ecs-service-${suffix}`,
            vpcSubnets: { subnets: subnets},
            cluster: cdkFargetCluster,
            taskDefinition: fargateTaskDefinition,
            desiredCount: 2,
            assignPublicIp: true,
            securityGroups: [sgForService]
          });

          const lb = new elbv2.ApplicationLoadBalancer(this, 'cdk-ecs-fargate-lb', { 
            vpc: props.vpc,
            vpcSubnets: { subnets: subnets},
            internetFacing: true,
            loadBalancerName:"cdk-ecs-fargate-alb",
            securityGroup: sgForService
          });

          const listener = lb.addListener('Listener', { 
            port: 80,
            open: true 
          });
          
          listener.addTargets('cdk-ecs-fargate-alb-target', {
            targetGroupName:`cdk-ecs-fargate-tg-${suffix}`,
            port: 80,
            targets: [service],
            healthCheck: {
              enabled: true,
              protocol: elbv2.Protocol.HTTP,
              path: "/sayHello",
              healthyHttpCodes:"200",
              healthyThresholdCount:3,
            }
          });
    }
    getSuffixFromStack(stack: Stack){
      const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
      const suffix = Fn.select(4, Fn.split('-', shortStackId));
      return suffix;
  }
}
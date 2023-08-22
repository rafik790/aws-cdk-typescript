import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface Ec2InstanceStackProps extends StackProps{
    vpc: ec2.Vpc
}

export class Ec2InstaceStack extends Stack{
    constructor(scope:Construct,id:string, props:Ec2InstanceStackProps){
        super(scope,id);
        
        const subnets = props.vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE_ISOLATED}).subnets;
        const webserverSG = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: props.vpc,
            description: 'Allow ssh access to ec2 instances',
            allowAllOutbound: true,
        });

        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22),'allow HTTP traffic from anywhere');
        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'allow HTTP traffic from anywhere');
        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(443),'allow HTTPS traffic from anywhere');

        //Create a SG for a backend server
        const backendServerSG = new ec2.SecurityGroup(this, 'backend-server-sg', {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: 'security group for a backend server',
          });

          backendServerSG.connections.allowFrom(
            new ec2.Connections({
              securityGroups: [webserverSG],
            }),
            ec2.Port.tcp(8000),
            'allow traffic on port 8000 from the webserver security group',
        );

        //Create a SG for a database server
        const dbserverSG = new ec2.SecurityGroup(this, 'database-server-sg', {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: 'security group for a database server',
        });
  
        dbserverSG.connections.allowFrom(
            new ec2.Connections({
            securityGroups: [backendServerSG],
            }),
            ec2.Port.tcp(3306),
            'allow traffic on port 3306 from the backend server security group',
        );
        

        const instance = new ec2.Instance(this, 'targetInstance', {
            vpc: props.vpc,
            vpcSubnets: { subnets: subnets},
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
            instanceName:"cdk-ec2-instace"
        });
        instance.addSecurityGroup(webserverSG);

    }
}
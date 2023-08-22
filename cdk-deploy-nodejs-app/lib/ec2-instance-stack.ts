import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { UserData } from "aws-cdk-lib/aws-ec2";
import { InstanceProfile, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { readFile, readFileSync } from "fs";

interface Ec2InstanceStackProps extends StackProps{
    vpc: ec2.Vpc;
    ec2InstanceName: string
}
const SSM_AGENT_RPM='https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm';
export class Ec2InstaceStack extends Stack{
    constructor(scope:Construct,id:string, props:Ec2InstanceStackProps){
        super(scope,id);

        const subnets = props.vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC}).subnets;
        const webserverSG = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: props.vpc,
            description: 'Allow ssh access to ec2 instances',
            allowAllOutbound: true,
        });
        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22),'allow HTTP traffic from anywhere');
        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'allow HTTP traffic from anywhere');
        webserverSG.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(443),'allow HTTPS traffic from anywhere');

        // define the IAM role that will allow the EC2 instance to communicate with SSM 
        const instanceRole = new Role(this, 'cdk-nodeapp-ole', {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com')
        });
        instanceRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        instanceRole.addToPolicy(new PolicyStatement({
            resources: ['*'],
            actions: ["s3:*"],
            conditions: {
                StringEquals:{
                    "aws:RequestedRegion":'ap-south-1'
                }
            }
        }));
        
        /*
        //create a profile to attch the role to the instance
        const profile = new InstanceProfile(this, `${id}Profile`, {
            role: instanceRole
        });

        
        const ssmaUserData = UserData.forLinux();
        ssmaUserData.addCommands(`sudo yum install -y ${SSM_AGENT_RPM}`, 'restart amazon-ssm-agent');
        ssmaUserData.addCommands("sudo yum update","sudo amazon-linux-extras install nginx1 -y","sudo systemctl start nginx.service","sudo systemctl enable httpd.service");

        const instance = new ec2.Instance(this, 'NodeJSAppInstance', {
            vpc: props.vpc,
            vpcSubnets: { subnets: subnets},
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
            instanceName:"nodejs-ec2-instace",
            userData: ssmaUserData,
            role: instanceRole,
            keyName:"kubernetes-ec2"
        });*/
        
        const userDataScript = readFileSync('./shellscripts/userdata.sh','utf8');
        const instance = new ec2.Instance(this, 'NodeJSAppInstance', {
            vpc: props.vpc,
            vpcSubnets: { subnets: subnets},
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
            machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
            instanceName: props.ec2InstanceName,
            role: instanceRole,
            keyName:"kubernetes-ec2"
        });

        instance.addSecurityGroup(webserverSG);
        instance.addUserData(userDataScript);

    }
}
import { Aspects, Stack, StackProps, Tag } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends Stack{
    public readonly vpc: ec2.Vpc;
    constructor(scope:Construct,id:string,props?:StackProps){
        super(scope,id);

        this.vpc = new ec2.Vpc(this, 'ApplicationVPC', {
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
            natGateways: 0,
            createInternetGateway: true,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            restrictDefaultSecurityGroup: true,
            availabilityZones:["ap-south-1a","ap-south-1b","ap-south-1c"],
            subnetConfiguration: [
              {
                subnetType: ec2.SubnetType.PUBLIC,
                name: 'public-subnet-1',
                cidrMask: 24,
              },
              {
                cidrMask: 24,
                name: 'private-subnet-1',
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
              }
            ],
          });
          Aspects.of(this.vpc).add(new Tag('Name', 'my-app-vpc'));

          this.vpc.addGatewayEndpoint('s3-endpoint', {
            service: ec2.GatewayVpcEndpointAwsService.S3
          });

          this.vpc.addGatewayEndpoint('dynamodb-endpoint', {
           service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
          });

          this.tagSubnets(this.vpc.privateSubnets, 'Name');
          this.tagSubnets(this.vpc.publicSubnets, 'Name');
          this.tagSubnets(this.vpc.isolatedSubnets, 'Name');
    }

    tagSubnets(subnets: ec2.ISubnet[], tagName: string) {
        for (const subnet of subnets) {
          let tagValue = `${this.vpc.node.id}-${subnet.node.id}-${subnet.availabilityZone}`;
          Aspects.of(subnet).add(new Tag(tagName, tagValue));
        }
    }
}
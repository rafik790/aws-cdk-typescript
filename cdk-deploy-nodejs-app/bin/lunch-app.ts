#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { Ec2InstaceStack } from '../lib/ec2-instance-stack';
import { NodeAppCicdStack } from '../lib/nodeapp-cicd-stack';
const app = new cdk.App();
const vpcStack = new VpcStack(app,"VpcStack");
const instanceName = "nodejs-ec2-instance";
const instanceStack = new Ec2InstaceStack(app,"EC2Stack",{
  vpc: vpcStack.vpc,
  ec2InstanceName: instanceName
});

const cicdStack = new NodeAppCicdStack(app,"NodeAppCicdStack",{
  ec2InstanceName: instanceName
}).addDependency(instanceStack);



#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HelloCdkStack } from '../lib/hello-cdk-stack';
import {MyEcsConstructStack} from '../lib/my-ecsforget-stact';
import {CdkStarterStack} from '../lib/cdk-starter-stack';
import { PhotosStack } from '../lib/photos-stack';
import {PhotosHandlerStack} from '../lib/photos-handler-stack';
import { BucketTagger } from './photo-bucket-aspect';
const app = new cdk.App();
//new HelloCdkStack(app, 'HelloCdkStack');
//new MyEcsConstructStack(app, 'MyEcsConstructStack');
//new CdkStarterStack(app, 'CdkStarterStack');
const photosStack = new PhotosStack(app,"PhotosStack");
new PhotosHandlerStack(app,"PhotosHandlerStack",{
    targetBucketArn: photosStack.photoBucketArn
});

const tagger = new BucketTagger('level','test');
cdk.Aspects.of(app).add(tagger);

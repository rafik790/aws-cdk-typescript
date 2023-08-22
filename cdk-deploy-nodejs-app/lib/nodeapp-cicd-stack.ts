import { Fn, RemovalPolicy, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as s3 from 'aws-cdk-lib/aws-s3';
interface CicdStackProps extends StackProps{
    ec2InstanceName: string
}
export class NodeAppCicdStack extends Stack{
    constructor(scope: Construct,id:string, props:CicdStackProps){
        super(scope,id);
        const suffix = this.getSuffixFromStack(this);
        const artifactBucket = new s3.Bucket(this, 'artifactBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            bucketName:`artifact-bucket-${suffix}`
        });

        const pipeline  =new codepipeline.Pipeline(this, 'cdk-typescript-pipeline',{
            pipelineName: 'cdk-typescript-pipeline',
            crossAccountKeys: false,
            enableKeyRotation: false,
            artifactBucket: artifactBucket
        }); 

        const sourceStage = pipeline.addStage({
            stageName: "Source"
        });

        const buildStage = pipeline.addStage({
            stageName:"Build"
        });

        const deploymentStage = pipeline.addStage({
            stageName:"Deployment"
        });

        //Code for source
        const sourceOutput = new codepipeline.Artifact();
        sourceOutput
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName:"GitHub_Source",
            owner: "rafik790",
            repo:"node-express-typescript",
            oauthToken: SecretValue.secretsManager('github-token'),
            output: sourceOutput,
            branch: 'main'
        });
        sourceStage.addAction(sourceAction);

        //Code for code build
        const buildProject = new codebuild.Project(this, 'MyProject', {
            projectName:"cdk-typescript-build",
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
            source: codebuild.Source.gitHub({
              owner: 'rafik790',
              repo: 'node-express-typescript',
              webhook: true,
              webhookTriggersBatchBuild: false
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                computeType: codebuild.ComputeType.SMALL
            }

        });

        const buildOutput = new codepipeline.Artifact();
        const codeBuildAction = new codepipeline_actions.CodeBuildAction({
            actionName:"Build",
            project: buildProject,
            input: sourceOutput,
            outputs: [buildOutput],
            environmentVariables: {
                COMMIT_ID:{
                    value:sourceAction.variables.commitId
                },

            }
        });
        buildStage.addAction(codeBuildAction);

        //Code for codedeploy
        const codeDeployApp = new codedeploy.ServerApplication(this, 'cdk-typescript-deployment', {
            applicationName: 'cdk-typescript-deployment', // optional property
        });

        const deploymentGroup = new codedeploy.ServerDeploymentGroup(this,"cdk-typescript-deploymentgroup",{
            application: codeDeployApp,
            deploymentGroupName:"cdk-typescript-deploymentgroup",
            installAgent: true,
            ec2InstanceTags: new codedeploy.InstanceTagSet({
                "Name":[props.ec2InstanceName]
            }),
            deploymentConfig: codedeploy.ServerDeploymentConfig.ALL_AT_ONCE
        });

        const codeDeployAction = new codepipeline_actions.CodeDeployServerDeployAction({
            actionName:"Deploy",
            input: buildOutput,
            runOrder: 1,
            deploymentGroup: deploymentGroup
        });
        deploymentStage.addAction(codeDeployAction);
    }

    getSuffixFromStack(stack: Stack){
        const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
        const suffix = Fn.select(4, Fn.split('-', shortStackId));
        return suffix;
    }
}
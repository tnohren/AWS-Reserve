import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { AuthorizationType, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';


export class SpaceStack extends Stack {

    private api = new RestApi(this, 'SpaceApi');
    private authorizer: AuthorizerWrapper;

    private spacesTable = new GenericTable(this, {
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location']
    });

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // Create Authorizer
        this.authorizer = new AuthorizerWrapper(this, this.api);

        // Typescript LambdaFunction example
        const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
            runtime: Runtime.NODEJS_16_X,
            entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
            handler: 'handler'
        });

        // Add permission to list buckets to our lambda
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*'); // usually bad practice to do *
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

        // Hello Api Lambda Integration
        const helloLambdaIntegration: LambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
        const helloLambdaResource = this.api.root.addResource('hello');
        helloLambdaResource.addMethod('GET', helloLambdaIntegration, optionsWithAuthorizer);
    
        // Spaces API Integrations
        const spaceResource = this.api.root.addResource('spaces');
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration);
        spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration);
        spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration);
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration);
    }
}
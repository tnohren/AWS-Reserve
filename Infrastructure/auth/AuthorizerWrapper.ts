import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { IdPoolWrapper } from "./IdPoolWrapper";

export class AuthorizerWrapper {
    private scope: Construct;
    private api: RestApi;
    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private idPoolWrapper: IdPoolWrapper;

    public authorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, api: RestApi) {
        this.scope = scope;
        this.api = api;
        this.intialize();
    }

    private intialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.initIdPoolWrapper();
        this.createAdminsGroup();
    }

    // Create Space User Pool
    private createUserPool() {
        this.userPool = new UserPool(this.scope, 'SpaceUserPool', {
            userPoolName: 'SpaceUserPool',
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            }
        });

        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        });
    }

    // Create Space User Pool Client
    private addUserPoolClient() {
        this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
            userPoolClientName: 'SpaceUserPool-client',
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        });

        new CfnOutput(this.scope, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        });
    }

    // Create Cognito Space User Pool Authorizer
    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceUserAuthorizer', {
            cognitoUserPools: [this.userPool],
            authorizerName: 'SpaceUserAuthorizer',
            identitySource: 'method.request.header.Authorization'
        });

        // Must attach API
        this.authorizer._attachToApi(this.api);
    }

    // Initialize ID Pools - authenticated, unauthenticated, admin
    private initIdPoolWrapper() {
        this.idPoolWrapper = new IdPoolWrapper(this.scope, this.userPool, this.userPoolClient);
    }

    // Create Admins Group - uses admin id pool
    private createAdminsGroup() {
        new CfnUserPoolGroup(this.scope, 'admins', {
            groupName: 'admins',
            userPoolId: this.userPool.userPoolId,
            roleArn: this.idPoolWrapper.adminRole.roleArn
        });
    }
}
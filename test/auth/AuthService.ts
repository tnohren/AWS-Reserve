import { Auth } from 'aws-amplify';
import Amplify from 'aws-amplify';
import { config } from './config';
import { CognitoUser } from '@aws-amplify/auth';
import * as AWS from 'aws-sdk';
import { Credentials } from 'aws-sdk/lib/credentials';

// Configure Authentication Settings
Amplify.configure({
    Auth: {
        mandatorySignIn: false,
        region: config.REGION,
        userPoolId: config.USER_POOL_ID,
        userPoolWebClientId: config.APP_CLIENT_ID,
        authenticationFlowType: 'USER_PASSWORD_AUTH',
        identityPoolId: config.IDENTITY_POOL_ID
    }
});

export class AuthService {
    // Authenticate login
    public async login(username: string, password: string) {
        const user = await Auth.signIn(username, password) as CognitoUser;
        return user;
    }

    // Get AWS Credentials
    public async getAWSTemporaryCreds(user: CognitoUser) {
        const identityPool = `cognito-idp.${config.REGION}.amazonaws.com/${config.USER_POOL_ID}`;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.IDENTITY_POOL_ID,
            Logins: {
                [identityPool]: user.getSignInUserSession()!.getIdToken().getJwtToken()
            }
        }, {
            region: config.REGION
        })

        await this.refreshCredentials();
    }

    // Refresh credentials for use after retrieving AWS credentials
    private async refreshCredentials(): Promise<void> {
        return new Promise((resolve, reject) => {
            (AWS.config.credentials as Credentials).refresh(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve()
                }
            })
        })
    }
}
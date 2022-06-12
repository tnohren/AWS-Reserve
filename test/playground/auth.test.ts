import { AuthService } from '../auth/AuthService';
import { config } from '../auth/config'
import * as AWS from 'aws-sdk';

async function calls() {
    const authService = new AuthService();

    const user = await authService.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);
    await authService.getAWSTemporaryCreds(user);
    const creds = AWS.config.credentials;

    const a = 1;
}

calls();
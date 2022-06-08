import { AuthService } from '../auth/AuthService';
import { config } from '../auth/config'

const authService = new AuthService();
const user = authService.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);
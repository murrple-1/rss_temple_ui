import { IEnvironment } from '@environments/ienvironment';

export const environment: IEnvironment = {
  production: false,
  envVar: {
    API_HOST: 'http://localhost:8000',
    GOOGLE_API_CLIENT_ID: '',
    FACEBOOK_APP_ID: '',
    ONBOARDING_YOUTUBE_EMBEDED_URL: '',
    ISSUE_TRACKER_URL: '',
    CLIENT_REPO_URL: '',
    SERVER_REPO_URL: '',
  },
};

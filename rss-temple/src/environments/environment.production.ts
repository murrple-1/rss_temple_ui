import { IEnvironment } from '@environments/ienvironment';

export const environment: IEnvironment = {
  production: true,
  envVar: {
    API_HOST: 'http://localhost:8000',
    GOOGLE_API_CLIENT_ID: '',
    FACEBOOK_APP_ID: '',
    ONBOARDING_YOUTUBE_EMBEDED_URL: '',
    ISSUE_TRACKER_URL: 'https://github.com/murrple-1/rss_temple_http/issues',
    CLIENT_REPO_URL: 'https://github.com/murrple-1/rss_temple_http',
    SERVER_REPO_URL: 'https://github.com/murrple-1/rss_temple',
  },
};

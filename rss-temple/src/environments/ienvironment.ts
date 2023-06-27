export interface IEnvironment {
  production: boolean;
  envVar: {
    API_HOST: string;
    GOOGLE_API_CLIENT_ID: string;
    FACEBOOK_APP_ID: string;
    ONBOARDING_YOUTUBE_EMBEDED_URL: string;
    ISSUE_TRACKER_URL: string;
    CLIENT_REPO_URL: string;
    SERVER_REPO_URL: string;
  };
}

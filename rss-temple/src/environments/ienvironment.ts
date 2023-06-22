export interface IEnvironment {
  production: boolean;
  envVar: {
    apiHost: string;
    googleApiClientId: string;
    facebookAppId: string;
    onboardingYoutubeEmbededUrl: string;
    issueTrackerUrl: string;
    clientRepoUrl: string;
    serverRepoUrl: string;
  };
}

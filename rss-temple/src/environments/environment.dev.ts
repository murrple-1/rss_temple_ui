import { IEnvironment } from '@environments/ienvironment';

export const environment: IEnvironment = {
  production: false,
  envVar: {
    apiHost: 'http://localhost:8000',
    googleApiClientId: '',
    facebookAppId: '',
    onboardingYoutubeEmbededUrl: '',
    issueTrackerUrl: '',
    clientRepoUrl: '',
    serverRepoUrl: '',
  },
};

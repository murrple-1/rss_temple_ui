// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { IEnvironment } from '@environments/ienvironment';

export const environment: IEnvironment = {
  production: false,
  apiHost: 'http://localhost:8000',
  googleApiClientId:
    '273767134750-hf0048uj3i5qhtlklq64bi6eflqsv3ja.apps.googleusercontent.com',
  facebookAppId: '548935532208111',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

import { Component } from '@angular/core';

import { environment } from '@environments/environment';

import osLicenses from '@app/os-licenses.json';

const licensesText = Object.entries(osLicenses)
  .filter(([projectName, _details]) => !projectName.includes('rss-temple'))
  .map(
    ([projectName, details]: [
      string,
      {
        licenses: string;
        repository?: string;
      },
    ]) => {
      projectName = projectName.replace(/@[\d\.\-A-Za-z]+$/, '');

      const divider = '-'.repeat(projectName.length);

      const parts: string[] = [`License: ${details.licenses}`];
      if (details.repository !== undefined) {
        parts.push(`Repository: ${details.repository}`);
      }

      return `${projectName}\n${divider}\n${parts.join('\n')}`;
    },
  )
  .join('\n\n');

const RSSIconSVG: string =
  require('!!raw-loader!../../../../../assets/images/rss-icon.svg').default;

@Component({
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  readonly issueTrackerUrl = environment.envVar.ISSUE_TRACKER_URL;
  readonly clientRepoUrl = environment.envVar.CLIENT_REPO_URL;
  readonly serverRepoUrl = environment.envVar.SERVER_REPO_URL;

  readonly licensesText = licensesText;
  readonly rssIconSvg = RSSIconSVG;
}

import { Component } from '@angular/core';

import osLicenses from '@app/os-licenses.json';
import { ConfigService } from '@app/services';

const RSSIconSVG: string =
  require('!!raw-loader!../../../../../assets/images/rss-icon.svg').default;

const licensesText = Object.entries(osLicenses)
  .filter(([projectName, _details]) => !projectName.includes('rss-temple-app'))
  .map(
    ([projectName, details]: [
      string,
      {
        licenses: string;
        repository?: string;
      },
    ]) => {
      projectName = projectName.replace(/@[\d.\-A-Za-z]+$/, '');

      const divider = '-'.repeat(projectName.length);

      const parts: string[] = [`License: ${details.licenses}`];
      if (details.repository !== undefined) {
        parts.push(`Repository: ${details.repository}`);
      }

      return `${projectName}\n${divider}\n${parts.join('\n')}`;
    },
  )
  .join('\n\n');

@Component({
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  readonly issueTrackerUrl: string;
  readonly clientRepoUrl: string;
  readonly serverRepoUrl: string;

  readonly licensesText = licensesText;
  readonly rssIconSvg = RSSIconSVG;

  constructor(configService: ConfigService) {
    const [issueTrackerUrl, clientRepoUrl, serverRepoUrl] =
      configService.getMany<string>(
        'issueTrackerUrl',
        'clientRepoUrl',
        'serverRepoUrl',
      );
    if (typeof issueTrackerUrl !== 'string') {
      throw new Error('issueTrackerUrl malformed');
    }
    if (typeof clientRepoUrl !== 'string') {
      throw new Error('clientRepoUrl malformed');
    }
    if (typeof serverRepoUrl !== 'string') {
      throw new Error('serverRepoUrl malformed');
    }

    this.issueTrackerUrl = issueTrackerUrl;
    this.clientRepoUrl = clientRepoUrl;
    this.serverRepoUrl = serverRepoUrl;
  }
}

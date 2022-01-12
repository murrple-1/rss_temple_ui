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

@Component({
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  readonly issueTrackerUrl = environment.issueTrackerUrl;
  readonly clientRepoUrl = environment.clientRepoUrl;
  readonly serverRepoUrl = environment.serverRepoUrl;

  readonly licensesText = licensesText;
}

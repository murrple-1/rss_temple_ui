import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { JsonValue, isJsonObject, isJsonArray } from '@app/libs/json.lib';
import { AuthTokenService } from '@app/services/auth-token.service';

import { environment } from '@environments/environment';

interface FeedDescriptor {
  name: string;
  feedUrl: string;
  homeUrl: string | null;
  imageSrc: string | null;
  entryTitles: string[];
  isSubscribed: boolean;
}

interface TagDescriptor {
  tagName: string;
  feeds: FeedDescriptor[];
}

@Injectable({
  providedIn: 'root',
})
export class ExploreService {
  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
  ) {}

  explore(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http
      .get<JsonValue>(`${environment.envVar.API_HOST}/api/explore`, {
        headers,
      })
      .pipe(
        map<JsonValue, TagDescriptor[]>(value => {
          if (!isJsonArray(value)) {
            throw new Error('JSON must be array');
          }

          return value.map<TagDescriptor>(tagJson => {
            if (!isJsonObject(tagJson)) {
              throw new Error('JSON entry must be object');
            }

            const tagName = tagJson.tagName;
            if (tagName === undefined) {
              throw new Error("'tagName' missing");
            }

            if (typeof tagName !== 'string') {
              throw new Error("'tagName' must be string");
            }

            const feeds_ = tagJson.feeds;
            if (feeds_ === undefined) {
              throw new Error("'feeds' missing");
            }

            if (!isJsonArray(feeds_)) {
              throw new Error("'feeds' must be array");
            }

            const feeds = feeds_.map<FeedDescriptor>(feedJson => {
              if (!isJsonObject(feedJson)) {
                throw new Error("'feeds' entry must be object");
              }

              const name = feedJson.name;
              if (name === undefined) {
                throw new Error("'name' missing");
              }

              if (typeof name !== 'string') {
                throw new Error("'name' must be string");
              }

              const feedUrl = feedJson.feedUrl;
              if (feedUrl === undefined) {
                throw new Error("'feedUrl' missing");
              }

              if (typeof feedUrl !== 'string') {
                throw new Error("'feedUrl' must be string");
              }

              const homeUrl = feedJson.homeUrl;
              if (homeUrl === undefined) {
                throw new Error("'homeUrl' missing");
              }

              if (homeUrl !== null && typeof homeUrl !== 'string') {
                throw new Error("'homeUrl' must be string or null");
              }

              const imageSrc = feedJson.imageSrc;
              if (imageSrc === undefined) {
                throw new Error("'imageSrc' missing");
              }

              if (imageSrc !== null && typeof imageSrc !== 'string') {
                throw new Error("'imageSrc' must be string or null");
              }

              const entryTitles = feedJson.entryTitles;
              if (entryTitles === undefined) {
                throw new Error("'entryTitles' missing");
              }

              if (!isJsonArray(entryTitles)) {
                throw new Error("'entryTitles' must be array");
              }

              for (const entryTitle of entryTitles) {
                if (typeof entryTitle !== 'string') {
                  throw new Error("'entryTitles' element must be string");
                }
              }

              const isSubscribed = feedJson.isSubscribed;
              if (isSubscribed === undefined) {
                throw new Error("'isSubscribed' missing");
              }

              if (typeof isSubscribed !== 'boolean') {
                throw new Error("'isSubscribed' must be boolean");
              }

              return {
                name,
                feedUrl,
                homeUrl,
                imageSrc,
                entryTitles: entryTitles as string[],
                isSubscribed,
              };
            });

            return {
              tagName,
              feeds,
            };
          });
        }),
      );
  }
}

import { JsonObject } from '@app/libs/json.lib';

export class User {
  uuid?: string;
  email?: string;
  attributes?: JsonObject;
  subscribedFeedUuids?: string[];
  hasGoogleLogin?: boolean;
  hasFacebookLogin?: boolean;
}

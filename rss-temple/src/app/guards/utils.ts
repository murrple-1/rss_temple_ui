import {
  ActivatedRouteSnapshot,
  PRIMARY_OUTLET,
  UrlTree,
} from '@angular/router';

export function areOldAndNewRoutesTheSame(
  currentRoute: ActivatedRouteSnapshot,
  newRoute: UrlTree,
) {
  const currentRouteUrl = currentRoute.url.join('');
  const newRouteUrl = newRoute.root.children[PRIMARY_OUTLET].segments.join('');

  return currentRouteUrl === newRouteUrl;
}

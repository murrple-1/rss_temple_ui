import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { routes } from './app.routing';

describe('app.routing', () => {
  it('should load lazy children', async () => {
    async function recurseRoutes(route: Route) {
      expect(route.path).toEqual(expect.any(String));

      if (route.children !== undefined) {
        for (const innerRoute of route.children) {
          await recurseRoutes(innerRoute);
        }
      } else if (typeof route.loadChildren === 'function') {
        const moduleClassPromise = route.loadChildren();
        if (moduleClassPromise instanceof Promise) {
          const moduleClass = await moduleClassPromise;
          if (moduleClass instanceof Type) {
            const module = new moduleClass();
            expect(module).toBeTruthy();
          } else {
            throw new Error('not supported');
          }
        } else {
          throw new Error('not supported');
        }
      }
    }

    for (const route of routes) {
      await recurseRoutes(route);
    }
  });
});

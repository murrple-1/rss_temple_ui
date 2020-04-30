import { Type } from '@angular/core';
import { async } from '@angular/core/testing';
import { Route } from '@angular/router';

import { routes } from './main.routing';

describe('main.routing', () => {
  it('should load lazy children', async(async () => {
    async function recurseRoutes(route: Route) {
      expect(typeof route.path).toBe('string');

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
            fail('not supported');
          }
        } else {
          fail('not supported');
        }
      }
    }

    for (const route of routes) {
      await recurseRoutes(route);
    }
  }));
});
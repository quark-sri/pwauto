import type { Page } from '@playwright/test';

/**
 * Build a lazy page-object fixture from a registry { name: PageClass }.
 * A page object is created the first time a step uses it, once per scenario.
 */
export function definePages<R extends Record<string, new (page: Page) => object>>(registry: R) {
  type Pages = { [K in keyof R]: InstanceType<R[K]> };
  return async ({ page }: { page: Page }, use: (pages: Pages) => Promise<void>): Promise<void> => {
    const cache = new Map<keyof R, object>();
    const pages = {} as Pages;
    for (const key of Object.keys(registry) as (keyof R)[]) {
      Object.defineProperty(pages, key, {
        enumerable: true,
        get: () => {
          if (!cache.has(key)) cache.set(key, new registry[key]!(page));
          return cache.get(key);
        },
      });
    }
    await use(pages);
  };
}

import { expect } from '@playwright/test';
import type { SortOption } from '../pages/CatalogPage';
import { Then, When } from '../fixtures';

When('I search for {string}', async ({ pages }, keyword: string) => {
  await pages.catalog.search(keyword);
});

When('I sort the products by {string}', async ({ pages }, option: string) => {
  await pages.catalog.sortBy(option as SortOption);
});

When('I filter by the category {string}', async ({ pages }, category: string) => {
  await pages.catalog.filterByCategory(category);
});

When('I open the {string} category from the menu', async ({ pages }, category: string) => {
  await pages.header.openCategory(category);
});

When('I open the product {string}', async ({ pages }, name: string) => {
  await pages.catalog.openProduct(name);
  await pages.product.waitUntilReady();
});

Then('I should see the search caption {string}', async ({ pages }, caption: string) => {
  await expect(pages.catalog.searchCaption).toHaveText(caption);
});

Then('every product name should contain {string}', async ({ pages }, keyword: string) => {
  // The list re-renders after a search or filter: retry until it settles.
  await expect(async () => {
    const names = await pages.catalog.names();
    expect(names.length, 'at least one product is listed').toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase(), `product "${name}"`).toContain(keyword.toLowerCase());
    }
  }).toPass();
});

Then('I should see the no-results message {string}', async ({ pages }, message: string) => {
  await expect(pages.catalog.noResults).toHaveText(message);
  await expect(pages.catalog.productNames).toHaveCount(0);
});

Then('the product prices should be in ascending order', async ({ pages }) => {
  await expect(async () => {
    const prices = await pages.catalog.prices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  }).toPass();
});

Then('the product names should be in alphabetical order', async ({ pages }) => {
  await expect(async () => {
    const names = await pages.catalog.names();
    expect(names.length).toBeGreaterThan(1);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  }).toPass();
});

Then('I should see the category title {string}', async ({ pages }, title: string) => {
  await expect(pages.catalog.pageHeading).toHaveText(title);
});

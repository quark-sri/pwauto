import { expect } from '@playwright/test';
import { parsePrice } from '../pages/CatalogPage';
import { Given, Then, When } from '../fixtures';

Given('I am viewing the product {string}', async ({ pages }, name: string) => {
  await pages.catalog.open();
  await pages.catalog.openProduct(name);
  await pages.product.waitUntilReady();
});

When('I add {int} of it to the cart', async ({ pages }, quantity: number) => {
  await pages.product.addToCart(quantity);
});

Then('I should see the product name {string}', async ({ pages }, name: string) => {
  await expect(pages.product.name).toHaveText(name);
});

Then('the product price should be {string}', async ({ pages }, price: string) => {
  // The page shows the currency sign outside the price element: compare amounts.
  await expect.poll(() => pages.product.price()).toBe(parsePrice(price));
});

Then('the product should have a description', async ({ pages }) => {
  await expect(pages.product.description).not.toBeEmpty();
});

Then('the product should be marked {string}', async ({ pages }, label: string) => {
  await expect(pages.product.outOfStockLabel).toHaveText(label);
});

Then('I should not be able to add it to the cart', async ({ pages }) => {
  await expect(pages.product.addToCartButton).toBeDisabled();
});

Then('I should see the confirmation {string}', async ({ pages }, message: string) => {
  await expect(pages.notifications.withText(message)).toBeVisible();
});

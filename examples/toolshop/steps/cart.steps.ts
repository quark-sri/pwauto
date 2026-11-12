import { expect } from '@playwright/test';
import { parsePrice } from '../pages/CatalogPage';
import { Given, Then, When } from '../fixtures';

Given('I have added {int} {string} to the cart', async ({ pages, ctx }, quantity: number, name: string) => {
  await pages.catalog.open();
  await pages.catalog.openProduct(name);
  await pages.product.waitUntilReady();
  ctx.set(`unitPrice:${name}`, await pages.product.price());
  await pages.product.addToCart(quantity);
  await expect(pages.header.cartQuantity).toHaveText(String(quantity));
});

When('I open the cart', async ({ pages }) => {
  await pages.header.openCart();
  await pages.cart.waitUntilReady();
});

When('I change the quantity of {string} to {int}', async ({ pages }, name: string, quantity: number) => {
  await pages.cart.setQuantity(name, quantity);
});

When('I remove {string} from the cart', async ({ pages }, name: string) => {
  await pages.cart.remove(name);
});

Then('the cart badge should show {int}', async ({ pages }, quantity: number) => {
  await expect(pages.header.cartQuantity).toHaveText(String(quantity));
});

Then('the cart should list {string} with quantity {int}', async ({ pages }, name: string, quantity: number) => {
  await expect(pages.cart.quantityOf(name)).toHaveValue(String(quantity));
});

Then(
  'the line total of {string} should be {int} times its unit price',
  async ({ pages, ctx }, name: string, quantity: number) => {
    const unitPrice = ctx.get<number>(`unitPrice:${name}`);
    const expected = `$${(unitPrice * quantity).toFixed(2)}`;
    await expect(pages.cart.lineTotalOf(name)).toHaveText(expected);
  },
);

Then('the cart total should equal the sum of the line totals', async ({ pages }) => {
  await expect(async () => {
    const lines = (await pages.cart.rows.getByTestId('line-price').allInnerTexts()).map(parsePrice);
    const sum = lines.reduce((a, b) => a + b, 0);
    expect(await pages.cart.totalAmount()).toBeCloseTo(sum, 2);
  }).toPass();
});

Then('the cart should have no products', async ({ pages }) => {
  await expect(pages.cart.rows).toHaveCount(0);
  await expect(pages.cart.emptyMessage).toBeVisible();
});

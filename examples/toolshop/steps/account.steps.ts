import { expect } from '@playwright/test';
import { getUser } from '@core/utils/users';
import { toolshopSuite } from '../suite';
import { Given, Then, When } from '../fixtures';

Given('I am a newly registered customer', async ({ api, auth, ctx }) => {
  const person = await api.registerCustomer();
  ctx.set('customer', person);
  await auth.loginWith({ role: 'new customer', username: person.email, password: person.password });
});

Given('I am on the login page', async ({ pages }) => {
  await pages.login.open();
});

When('I sign in as the {string} user', async ({ pages }, role: string) => {
  const user = getUser(role, toolshopSuite.use.defaultUsers);
  await pages.login.login(user.username, user.password);
});

When('I sign in with email {string} and password {string}', async ({ pages }, email: string, password: string) => {
  await pages.login.login(email, password);
});

When('I submit the login form without any details', async ({ pages }) => {
  await pages.login.submit.click();
});

When('I sign out', async ({ pages }) => {
  await pages.header.signOutUser();
});

Then('I should be on my account page', async ({ pages, page }) => {
  await expect(page).toHaveURL(/\/account$/);
  await expect(pages.account.heading).toBeVisible();
});

Then('the navigation menu should show my name {string}', async ({ pages }, name: string) => {
  await expect(pages.header.userMenu).toHaveText(name);
});

Then('I should see the login error {string}', async ({ pages }, message: string) => {
  await expect(pages.login.loginError).toHaveText(message);
});

Then('I should still be on the login page', async ({ page, pages }) => {
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(pages.login.submit).toBeVisible();
});

Then('I should see the field error {string}', async ({ page }, message: string) => {
  await expect(
    page
      .getByTestId(/-error$/)
      .filter({ hasText: message })
      .first(),
  ).toBeVisible();
});

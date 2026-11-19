import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { buildPerson } from '@core/utils/data-factory';
import { Given, Then, When } from '../fixtures';

/** A valid message for the Toolshop contact form: it needs at least 50 characters. */
function validMessage(): string {
  return faker.lorem.sentences(3).padEnd(60, '.');
}

Given('I am on the contact page', async ({ pages }) => {
  await pages.contact.open();
});

When('I send a contact message about {string} with a valid text', async ({ pages }, subject: string) => {
  const person = buildPerson();
  await pages.contact.sendMessage({ ...person, subject, message: validMessage() });
});

When(
  'I send a contact message about {string} with the text {string}',
  async ({ pages }, subject: string, message: string) => {
    const person = buildPerson();
    await pages.contact.sendMessage({ ...person, subject, message });
  },
);

When('I send the contact form with my name and email only', async ({ pages }) => {
  const { firstName, lastName, email } = buildPerson();
  await pages.contact.sendMessage({ firstName, lastName, email });
});

Then('I should see the contact confirmation', async ({ pages }) => {
  await expect(pages.contact.successMessage).toBeVisible();
});

import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';

export class ContactPage extends BasePage {
  protected readonly path = '/contact';

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly send: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.email = page.getByRole('textbox', { name: 'Email address' });
    this.subject = page.getByRole('combobox', { name: 'Subject' });
    this.message = page.getByRole('textbox', { name: 'Message' });
    this.send = page.getByRole('button', { name: 'Send' });
    this.successMessage = page.getByRole('alert').filter({ hasText: /Thanks for your message/i });
  }

  protected readyIndicator(): Locator {
    return this.send;
  }

  /** The validation message shown under a field, for example "Subject is required". */
  fieldError(field: 'first-name' | 'last-name' | 'email' | 'subject' | 'message'): Locator {
    return this.testId(`${field}-error`);
  }

  async sendMessage(fields: {
    firstName?: string;
    lastName?: string;
    email?: string;
    subject?: string;
    message?: string;
  }): Promise<void> {
    if (fields.firstName !== undefined) await this.firstName.fill(fields.firstName);
    if (fields.lastName !== undefined) await this.lastName.fill(fields.lastName);
    if (fields.email !== undefined) await this.email.fill(fields.email);
    if (fields.subject !== undefined) await this.subject.selectOption({ label: fields.subject });
    if (fields.message !== undefined) await this.message.fill(fields.message);
    await this.send.click();
  }
}

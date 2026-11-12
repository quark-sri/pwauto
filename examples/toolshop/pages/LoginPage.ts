import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';

  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly loginError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByLabel('Email address');
    this.password = page.getByLabel('Password', { exact: false }).and(page.locator('input'));
    this.submit = page.getByRole('button', { name: 'Login' });
    this.loginError = this.testId('login-error');
    this.emailError = this.testId('email-error');
    this.passwordError = this.testId('password-error');
  }

  protected readyIndicator(): Locator {
    return this.submit;
  }

  async login(username: string, password: string): Promise<void> {
    await this.email.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}

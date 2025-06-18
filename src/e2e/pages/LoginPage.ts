import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly docuLogo: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.docuLogo = page.locator('.logo').nth(0);
    this.emailField = page.locator('input[type="email"]');
    this.passwordField = page.locator('input[type="password"]');
    this.signInButton = page.locator('#submit-btn');
    this.forgotPasswordLink = page.getByText('Forgot password?');
    this.errorMessage = page.locator('#toast-container');
  }

  async goToPage(url: string) {
    await this.page.goto(url);
  }

  async loadPage() {
    await expect(this.page).toHaveTitle('DocuSketch - Sign in');
    await expect(this.docuLogo).toBeVisible();
    await expect(this.emailField).toBeVisible();
    await expect(this.passwordField).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async typeEmailandPassword(email: string, password: string) {
    await this.emailField.fill(email);
    await this.emailField.dispatchEvent('input');
    await this.passwordField.fill(password);
    await this.passwordField.dispatchEvent('input');
  }

  // Za pozitivne testove – čeka da dugme bude enabled
  async clickSigninButton() {
    await expect(this.signInButton).toBeEnabled({ timeout: 10000 });
    await this.signInButton.click();
  }

  // Za negativne testove – pokušava klik bez čekanja (ali i dalje Playwright neće kliknuti ako je disabled)
  async forceClickSigninButton() {
    await this.signInButton.click();
  }

  async wrongEmailPassword() {
    await expect(this.errorMessage).toBeVisible();
  }
}

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
    await this.passwordField.fill(password);
  }

  /**
   * Čeka da dugme submit postane enabled, stabilno i klikne
   */
  async clickSigninButton() {
    await this.waitForSubmitButtonEnabled();
    await this.signInButton.click();
  }

  /**
   * Koristi za negativne testove kada dugme može ostati disabled
   */
  async forceClickSigninButton() {
    await this.signInButton.click({ trial: true }).catch(() => {
      // ignorisi grešku ako je dugme disabled
    });
  }

  async wrongEmailPassword() {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Čekanje dok dugme ne postane aktivno (koristi native disabled property)
   */
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  async waitForSubmitButtonEnabled(timeout: number = 10000) {
    await this.signInButton.waitFor({ state: 'visible', timeout });

    await this.signInButton.evaluate((btn) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<void>((resolve, reject) => {
        const check = () => {
          if (!(btn as HTMLButtonElement).disabled) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    });
  }
}

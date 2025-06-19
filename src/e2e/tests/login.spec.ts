import { test } from '@playwright/test';
import { LoginPage, ProjectsPage } from '../pages';

test.describe('Log In tests', () => {
  let loginPage: LoginPage;
  let projectsPage: ProjectsPage;

  const login_email = process.env.EMAIL as string;
  const login_password = process.env.PASSWORD as string;
  const url = process.env.URL ?? '';

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectsPage = new ProjectsPage(page);

    await loginPage.goToPage(url);
    await loginPage.loadPage();
  });

  test('Negative Log In, Wrong Email', async () => {
    await loginPage.typeEmailandPassword('wrong@email.com', login_password);
    await loginPage.clickSigninButton(); // koristi "forceClick" bez čekanja
    await loginPage.wrongEmailPassword();
  });

  test('Negative Log In, Wrong Password', async () => {
    await loginPage.typeEmailandPassword(login_email, 'wrong-password');
    await loginPage.clickSigninButton();
    await loginPage.wrongEmailPassword();
  });

  test('Positive Log In', async () => {
    await loginPage.typeEmailandPassword(login_email, login_password);

    // ⚠️ Čeka da dugme za login postane enabled — kritično za CI
    await loginPage.waitForSubmitButtonEnabled();

    await loginPage.clickSigninButton();
    await projectsPage.loadPage();
  });
});

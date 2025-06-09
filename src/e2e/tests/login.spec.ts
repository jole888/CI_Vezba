import { test } from '@playwright/test';
import { LoginPage, ProjectsPage } from '../pages';

test.describe('Log In tests', () => {
  let loginPage: LoginPage;
  let projectsPage: ProjectsPage;

  const login_email = process.env.EMAIL as string;
  const login_password = process.env.PASSWORD as string;
  const url = process.env.URL as string;

  test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    projectsPage = new ProjectsPage(page);

  });
  test('Negative Log In, Wrong Email', async () => {
    await loginPage.typeEmailandPassword("wqwqwq@sa.sa", login_password);
    await loginPage.wrongEmailPassword()
  });

  test('Negative Log In, Wrong Password', async () => {
    await loginPage.typeEmailandPassword(login_email, "login_password");
    await loginPage.wrongEmailPassword()
  });

  test('Positive Log In', async () => {
    await loginPage.typeEmailandPassword(login_email, login_password);
    await projectsPage.loadPage()
  });
});
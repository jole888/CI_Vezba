import { expect, Locator, Page } from '@playwright/test'

export class ProjectsPage {
  readonly page: Page
  readonly projectsLabel: Locator
  readonly createProjectsButton: Locator

  constructor(page: Page) {
    this.page = page
    this.projectsLabel = page.getByText('Active projects')
    this.createProjectsButton = page.getByText('Create project')
  }

  async loadPage() {
    await expect(this.projectsLabel).toBeVisible()
    await expect(this.createProjectsButton).toBeVisible()
  }
}

import type { Page } from '@playwright/test';

import { disableGuidedTour } from './utils';

export class NavigationHelper {
  private readonly defaultNamespace = 'openshift-mtv';
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private buildK8sUrl(options: {
    resource: string;
    name?: string;
    namespace?: string;
    action?: 'new' | 'edit';
    allNamespaces?: boolean;
  }): string {
    const { resource, name, namespace, action, allNamespaces = false } = options;

    let url = '/k8s/';

    if (allNamespaces) {
      url += action === 'new' ? 'cluster/' : 'all-namespaces/';
    } else if (namespace) {
      url += `ns/${namespace}/`;
    } else {
      url += `ns/${this.defaultNamespace}/`;
    }

    url += `forklift.konveyor.io~v1beta1~${resource}`;

    if (name) {
      url += `/${name}`;
    }

    if (action) {
      url += `/~${action}`;
    }

    return url;
  }

  async navigateToConsole(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToK8sResource(options: {
    resource: string;
    name?: string;
    namespace?: string;
    action?: 'new' | 'edit';
    allNamespaces?: boolean;
  }): Promise<void> {
    const url = this.buildK8sUrl(options);

    await disableGuidedTour(this.page);
    await this.page.goto(url);
  }

  async navigateToMigrationMenu(): Promise<void> {
    await this.navigateToConsole();
    await this.page.getByTestId('migration-nav-item').click({ timeout: 20000 });
  }

  async navigateToPlans(): Promise<void> {
    await this.navigateToMigrationMenu();
    await this.page.getByTestId('plans-nav-item').click();
  }

  async navigateToProviders(): Promise<void> {
    await this.navigateToMigrationMenu();
    await this.page.getByTestId('providers-nav-item').click();
  }
}

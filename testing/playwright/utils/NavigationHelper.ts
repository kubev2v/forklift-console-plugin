import type { Page } from '@playwright/test';

import { MTV_NAMESPACE } from './resource-manager/constants';
import { disableGuidedTour } from './utils';
import { isVersionAtLeast, V2_11_0 } from './version';

export class NavigationHelper {
  private readonly defaultNamespace = MTV_NAMESPACE;
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
    tab?: string;
  }): string {
    const { resource, name, namespace, action, allNamespaces = false, tab } = options;

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

    if (tab) {
      url += `/${tab}`;
    }

    if (action) {
      url += `/~${action}`;
    }

    return url;
  }

  async navigateToConsole(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await disableGuidedTour(this.page);
  }

  async navigateToK8sResource(options: {
    resource: string;
    name?: string;
    namespace?: string;
    action?: 'new' | 'edit';
    allNamespaces?: boolean;
    tab?: string;
  }): Promise<void> {
    const url = this.buildK8sUrl(options);
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    await disableGuidedTour(this.page);
  }

  async navigateToMigrationMenu(): Promise<void> {
    await this.navigateToConsole();
    if (isVersionAtLeast(V2_11_0)) {
      await this.page.getByTestId('migration-nav-item').click({ timeout: 20000 });
    } else {
      await this.page.getByRole('link', { name: /Migration/i }).click({ timeout: 20000 });
    }
  }

  async navigateToOverview(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.page.goto('/mtv/overview');
    await this.page.waitForLoadState('networkidle');

    await disableGuidedTour(this.page);
  }

  async navigateToOverviewSettings(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.page.goto('/mtv/overview/settings');
    await this.page.waitForLoadState('networkidle');

    await disableGuidedTour(this.page);
  }

  async navigateToPlans(): Promise<void> {
    if (isVersionAtLeast(V2_11_0)) {
      await this.navigateToMigrationMenu();
      await this.page.getByTestId('plans-nav-item').click();
    } else {
      await this.navigateToConsole();
      await this.page.goto(this.buildK8sUrl({ resource: 'Plan', allNamespaces: true }));
      await this.page.waitForLoadState('networkidle');
      await disableGuidedTour(this.page);
    }
  }

  async navigateToProviders(): Promise<void> {
    if (isVersionAtLeast(V2_11_0)) {
      await this.navigateToMigrationMenu();
      await this.page.getByTestId('providers-nav-item').click();
    } else {
      await this.navigateToConsole();
      await this.page.goto(this.buildK8sUrl({ resource: 'Provider', allNamespaces: true }));
      await this.page.waitForLoadState('networkidle');
      await disableGuidedTour(this.page);
    }
  }
}

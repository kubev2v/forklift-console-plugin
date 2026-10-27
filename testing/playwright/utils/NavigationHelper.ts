import type { Page } from '@playwright/test';

import { MTV_NAMESPACE } from './resource-manager/constants';
import { prepareConsolePage } from './utils';

export class NavigationHelper {
  private readonly defaultNamespace = MTV_NAMESPACE;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private buildK8sUrl(options: {
    action?: 'new' | 'edit';
    allNamespaces?: boolean;
    name?: string;
    namespace?: string;
    resource: string;
    tab?: string;
  }): string {
    const { action, allNamespaces = false, name, namespace, resource, tab } = options;

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
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
  }

  async navigateToK8sResource(options: {
    action?: 'new' | 'edit';
    allNamespaces?: boolean;
    name?: string;
    namespace?: string;
    resource: string;
    tab?: string;
  }): Promise<void> {
    const url = this.buildK8sUrl(options);
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
  }

  async navigateToMigrationMenu(): Promise<void> {
    await this.navigateToConsole();
    await this.page.getByTestId('migration-nav-item').click({ timeout: 20000 });
  }

  /** Matches `CreatePlanAction` navigation (`getResourceUrl` cluster path + query params). */
  async navigateToNewPlanFromSourceProvider(
    sourceProvider: string,
    planProject = this.defaultNamespace,
  ): Promise<void> {
    const params = new URLSearchParams({
      planProject,
      sourceProvider,
    });
    const path = this.buildK8sUrl({ action: 'new', allNamespaces: true, resource: 'Plan' });
    await this.page.goto(`${path}?${params.toString()}`);
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
  }

  async navigateToOverview(): Promise<void> {
    await this.page.goto('/mtv/overview');
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
  }

  async navigateToOverviewSettings(): Promise<void> {
    await this.page.goto('/mtv/overview/settings');
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
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

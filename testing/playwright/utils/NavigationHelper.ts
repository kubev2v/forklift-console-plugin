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
      url += 'all-namespaces/';
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

  async navigateToCreatePlanWizard(): Promise<void> {
    const url = '/k8s/cluster/forklift.konveyor.io~v1beta1~Plan/~new';

    await disableGuidedTour(this.page);
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToMigrationMenu(): Promise<void> {
    await this.navigateToConsole();
    await this.page.getByTestId('migration-nav-item').click({ timeout: 5000 });
  }

  async navigateToPlanDetails(planName: string, namespace?: string): Promise<void> {
    const url = this.buildK8sUrl({
      resource: 'Plan',
      name: planName,
      namespace: namespace ?? this.defaultNamespace,
    });

    await disableGuidedTour(this.page);
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
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

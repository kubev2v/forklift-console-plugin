import { expect, type Page } from '@playwright/test';

export class NetworkMapDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyNetworkMapDetailsPage(expectedData: {
    networkMapName: string;
    sourceProvider: string;
    targetProvider: string;
  }) {
    await expect(this.page).toHaveURL(
      new RegExp(
        `/k8s/ns/[^/]+/forklift\\.konveyor\\.io~v1beta1~NetworkMap/${expectedData.networkMapName}$`,
      ),
    );
  }
}

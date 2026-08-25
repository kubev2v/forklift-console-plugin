import { expect, type Page } from '@playwright/test';

import { getMonacoEditorValue, setMonacoEditorValue } from '../utils/monaco';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export class YamlEditorPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async copyYamlToClipboard(): Promise<string> {
    const yamlContent = await this.getYamlContent();
    await this.page.getByRole('button', { name: 'Copy code to clipboard' }).click();
    return yamlContent;
  }

  async fillYamlContent(yamlContent: string): Promise<void> {
    const success = await this.page.evaluate(setMonacoEditorValue, { content: yamlContent });
    if (!success) {
      throw new Error('Failed to set YAML content - Monaco editor not found');
    }
  }

  async getYamlContent(): Promise<string> {
    return this.page.evaluate(getMonacoEditorValue);
  }

  async submitYamlForm(expectedName: string, resourceType: string): Promise<void> {
    await this.page.locator('[data-test="save-changes"]').click();
    await expect(this.page).toHaveURL(
      new RegExp(
        `/k8s/ns/${MTV_NAMESPACE}/forklift\\.konveyor\\.io~v1beta1~${resourceType}/${expectedName}`,
        'u',
      ),
    );
  }

  async waitForYamlEditorLoad(): Promise<void> {
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }
}

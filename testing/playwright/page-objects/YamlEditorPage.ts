import { expect, type Page } from '@playwright/test';

import { isEmpty } from '../utils/utils';

export class YamlEditorPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async copyYamlToClipboard(): Promise<string> {
    const yamlContent = await this.getYamlContent();
    await this.page.getByRole('button', { name: 'Copy code to clipboard' }).click();
    await expect(this.page.getByText('Content copied to clipboard')).toBeVisible();
    return yamlContent;
  }

  async fillYamlContent(yamlContent: string): Promise<void> {
    await this.page.evaluate((content) => {
      const monacoInstance = (globalThis as any).monaco?.editor?.getModels?.()?.[0];
      if (monacoInstance) {
        monacoInstance.setValue(content);
      } else {
        const editors = (globalThis as any).monaco?.editor?.getEditors?.();
        if (editors && Array.isArray(editors) && !isEmpty(editors)) {
          editors[0].setValue(content);
        }
      }
    }, yamlContent);
  }

  async getYamlContent(): Promise<string> {
    const yamlContent = await this.page.evaluate(() => {
      const monacoInstance = (globalThis as any).monaco?.editor?.getModels?.()?.[0];
      if (monacoInstance) {
        return monacoInstance.getValue() as string;
      }
      return '';
    });
    return yamlContent;
  }

  async submitYamlForm(expectedName: string, resourceType: string): Promise<void> {
    await this.page.locator('[data-test="save-changes"]').click();
    await expect(this.page).toHaveURL(
      new RegExp(
        `/k8s/ns/openshift-mtv/forklift\\.konveyor\\.io~v1beta1~${resourceType}/${expectedName}`,
      ),
    );
  }

  async waitForYamlEditorLoad(): Promise<void> {
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }
}

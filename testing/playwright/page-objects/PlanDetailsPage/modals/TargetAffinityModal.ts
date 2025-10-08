import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class TargetAffinityModal extends BaseModal {
  readonly addAffinityRuleButton: Locator;
  readonly addRuleDialog: Locator;

  constructor(page: Page) {
    super(page, 'affinity-modal');
    this.addAffinityRuleButton = this.page.getByTestId('add-affinity-rule-button');
    this.addRuleDialog = this.page.getByTestId('affinity-edit-modal');
  }

  async addExpression(): Promise<void> {
    const addExpressionButton = this.addRuleDialog.getByTestId('add-affinity-expression-button');
    await addExpressionButton.click();
    await expect(this.page.getByPlaceholder('Enter key')).toBeVisible();
  }

  async addField(): Promise<void> {
    const addFieldButton = this.addRuleDialog.getByTestId('add-affinity-field-button');
    await addFieldButton.click();
  }

  async clickAddAffinityRule(): Promise<void> {
    await this.addAffinityRuleButton.click();
    await expect(this.addRuleDialog).toBeVisible();
  }

  async fillExpressionKey(key: string, index = 0): Promise<void> {
    const keyInput = this.page.getByPlaceholder('Enter key').nth(index);
    await keyInput.waitFor({ state: 'visible' });
    await keyInput.fill(key);
  }

  async fillExpressionValue(value: string, index = 0): Promise<void> {
    const valueInput = this.page.getByPlaceholder('Enter value').nth(index);
    await valueInput.waitFor({ state: 'visible' });
    await valueInput.fill(value);

    const createButton = this.page.getByTestId('multi-typeahead-select-create-option');
    await expect(createButton).toBeVisible();
    await createButton.click();
    await expect.soft(createButton).not.toBeVisible();
  }

  async fillTopologyKey(topologyKey: string): Promise<void> {
    const topologyKeyInput = this.addRuleDialog.getByTestId('affinity-topology-key-input');
    await topologyKeyInput.waitFor({ state: 'visible' });
    await topologyKeyInput.fill(topologyKey);
  }

  async fillWeight(weight: string): Promise<void> {
    const weightInput = this.addRuleDialog.getByTestId('affinity-weight-input');
    await weightInput.waitFor({ state: 'visible' });
    await weightInput.fill(weight);
  }

  async saveAffinityRule(): Promise<void> {
    const saveRuleButton = this.page.getByTestId('save-affinity-rule-button');
    await expect(saveRuleButton).toBeEnabled();
    await saveRuleButton.click();
    await expect(this.addRuleDialog).not.toBeVisible();
  }

  async selectAffinityType(
    type: 'Node affinity' | 'Workload (pod) affinity' | 'Workload (pod) anti-affinity',
  ): Promise<void> {
    const typeSelect = this.addRuleDialog.getByTestId('affinity-type-select');
    await typeSelect.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  async selectExpressionOperator(
    operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist',
    index = 0,
  ): Promise<void> {
    const operatorButton = this.addRuleDialog
      .locator('button[aria-label="Options menu"]')
      .nth(index);
    await operatorButton.click();
    await this.page.getByRole('option', { name: operator, exact: true }).click();
  }

  async selectRuleType(
    ruleType: 'Required during scheduling' | 'Preferred during scheduling',
  ): Promise<void> {
    const conditionSelect = this.addRuleDialog.getByTestId('affinity-condition-select');
    await conditionSelect.click();
    await this.page.getByRole('option', { name: ruleType, exact: true }).click();
  }

  async verifyAffinityRuleExists(): Promise<void> {
    const rulesList = this.modal.getByTestId('affinity-rules-list');
    await expect(rulesList).toBeVisible();

    await expect(this.modal.getByText('No affinity rules found')).not.toBeVisible();
  }

  async verifyAffinityTypeOptions(expectedOptions: string[]): Promise<void> {
    const typeSelect = this.addRuleDialog.getByTestId('affinity-type-select');
    await typeSelect.click();

    for (const option of expectedOptions) {
      await expect(this.page.getByRole('option', { name: option, exact: true })).toBeVisible();
    }

    await typeSelect.click();

    await expect(this.page.getByRole('option').first()).not.toBeVisible();
  }

  async verifyConditionOptions(expectedOptions: string[]): Promise<void> {
    const conditionSelect = this.addRuleDialog.getByTestId('affinity-condition-select');
    await conditionSelect.click();

    for (const option of expectedOptions) {
      await expect(this.page.getByRole('option', { name: option, exact: true })).toBeVisible();
    }

    await conditionSelect.click();

    await expect(this.page.getByRole('option').first()).not.toBeVisible();
  }
}

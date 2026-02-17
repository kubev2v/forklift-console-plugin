import { expect, type Page } from '@playwright/test';

import type { HookConfig, NetworkMap, PlanTestData, StorageMap } from '../../../types/test-data';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';

export class ReviewStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async verifyHookFields(hookType: 'pre' | 'post', hookConfig?: HookConfig): Promise<void> {
    const prefix = `review-${hookType}-migration-hook`;
    const enabledLocator = this.page.getByTestId(`${prefix}-enabled`);

    await expect(enabledLocator).toBeVisible();

    if (!hookConfig) {
      return;
    }

    const expectedEnabled = hookConfig.enabled ? 'True' : 'False';
    await expect(enabledLocator).toHaveText(expectedEnabled);

    if (hookConfig.enabled) {
      if (hookConfig.hookRunnerImage) {
        await expect(this.page.getByTestId(`${prefix}-runner-image`)).toHaveText(
          hookConfig.hookRunnerImage,
        );
      }

      if (hookConfig.serviceAccount) {
        await expect(this.page.getByTestId(`${prefix}-service-account`)).toHaveText(
          hookConfig.serviceAccount,
        );
      }

      const playbookLocator = this.page.getByTestId(`${prefix}-ansible-playbook`);
      await expect(playbookLocator).toBeVisible();
      if (hookConfig.ansiblePlaybook) {
        await expect(playbookLocator).not.toHaveText('None');
      }
    }
  }

  async clickEditStepInSection(
    sectionName:
      | 'General'
      | 'Virtual machines'
      | 'Network map'
      | 'Storage map'
      | 'Migration type'
      | 'Other settings'
      | 'Hooks',
  ): Promise<void> {
    const sectionMap = {
      General: 'review-general-section',
      'Virtual machines': 'review-virtual-machines-section',
      'Network map': 'review-network-map-section',
      'Storage map': 'review-storage-map-section',
      'Migration type': 'review-migration-type-section',
      'Other settings': 'review-other-settings-section',
      Hooks: 'review-hooks-section',
    };

    const section = this.page.getByTestId(sectionMap[sectionName]);
    await section.getByRole('button', { name: 'Edit step' }).click();
  }

  async verifyAllSections(planData: PlanTestData): Promise<void> {
    await this.verifyGeneralSection(planData);
    await this.verifyVirtualMachinesSection();
    await this.verifyNetworkMapSection(planData.networkMap);
    await this.verifyStorageMapSection(planData.storageMap);
    await this.verifyMigrationTypeSection();
    await this.verifyOtherSettingsSection(planData.additionalPlanSettings);
    await this.verifyHooksSection();
  }

  async verifyGeneralSection(expectedData: PlanTestData): Promise<void> {
    await expect(this.page.getByTestId('review-general-section')).toBeVisible();
    await expect(this.page.getByTestId('review-plan-name')).toContainText(expectedData.planName);
    await expect(this.page.getByTestId('review-plan-project')).toContainText(
      expectedData.planProject,
    );
    if (expectedData.description && isVersionAtLeast(V2_11_0)) {
      await expect(this.page.getByTestId('review-plan-description')).toContainText(
        expectedData.description,
      );
    }
    await expect(this.page.getByTestId('review-source-provider')).toContainText(
      expectedData.sourceProvider,
    );
    await expect(this.page.getByTestId('review-target-provider')).toContainText(
      expectedData.targetProvider,
    );
    await expect(this.page.getByTestId('review-target-project')).toContainText(
      expectedData.targetProject.name,
    );
  }

  async verifyHooksSection(preHook?: HookConfig, postHook?: HookConfig): Promise<void> {
    await expect(this.page.getByTestId('review-hooks-section')).toBeVisible();
    await this.verifyHookFields('pre', preHook);
    await this.verifyHookFields('post', postHook);
  }

  async verifyMigrationTypeSection(): Promise<void> {
    await expect(this.page.getByTestId('review-migration-type-section')).toBeVisible();
    await expect(this.page.getByTestId('review-migration-type')).toBeVisible();
  }

  async verifyNetworkMapSection(expectedNetworkMap: NetworkMap): Promise<void> {
    const section = this.page.getByTestId('review-network-map-section');
    await expect(section).toBeVisible();

    if (expectedNetworkMap?.name) {
      if (isVersionAtLeast(V2_11_0)) {
        const testId = expectedNetworkMap.isPreexisting
          ? 'review-network-map'
          : 'review-network-map-name';
        await expect(section.getByTestId(testId)).toContainText(expectedNetworkMap.name);
      } else {
        await expect(
          section.locator('.pf-v5-c-description-list__group', { hasText: 'Network map name' }),
        ).toContainText(expectedNetworkMap.name);
      }
    }
  }

  async verifyOtherSettingsSection(
    additionalPlanSettings: PlanTestData['additionalPlanSettings'],
  ): Promise<void> {
    await expect(this.page.getByTestId('review-other-settings-section')).toBeVisible();
    await expect(this.page.getByTestId('review-transfer-network')).toBeVisible();

    if (additionalPlanSettings?.targetPowerState) {
      // Map power state values to their user-visible labels
      const powerStateLabels: Record<string, string> = {
        auto: 'Auto (Power on after migration)',
        on: 'Powered on',
        off: 'Powered off',
      };
      const expectedLabel = powerStateLabels[additionalPlanSettings.targetPowerState];

      await expect(this.page.getByTestId('review-target-power-state')).toHaveText(expectedLabel);
    }
  }

  async verifyReviewStep(planData: PlanTestData): Promise<void> {
    await this.verifyStepVisible();
    await this.verifyAllSections(planData);
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-review-step')).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Review and create/i })).toBeVisible();
  }

  async verifyStorageMapSection(expectedStorageMap: StorageMap): Promise<void> {
    const section = this.page.getByTestId('review-storage-map-section');
    await expect(section).toBeVisible();
    if (expectedStorageMap?.name) {
      if (isVersionAtLeast(V2_11_0)) {
        if (expectedStorageMap.isPreexisting) {
          await expect(section.getByTestId('review-storage-map')).toContainText(
            expectedStorageMap.name,
          );
        } else {
          await expect(
            section.locator('.pf-v6-c-description-list__group', { hasText: 'Storage map name' }),
          ).toContainText(expectedStorageMap.name);
        }
      } else {
        await expect(
          section.locator('.pf-v5-c-description-list__group', { hasText: 'Storage map name' }),
        ).toContainText(expectedStorageMap.name);
      }
    }
  }

  async verifyVirtualMachinesSection(): Promise<void> {
    await expect(this.page.getByTestId('review-virtual-machines-section')).toBeVisible();
    await expect(this.page.getByTestId('review-vm-count')).toContainText(
      'virtual machine selected',
    );
  }
}

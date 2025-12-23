import { expect, type Locator, type Page } from '@playwright/test';

import { MigrationType } from '../../../types/enums';
import type { PlanTestData } from '../../../types/test-data';

export class MigrationTypeStep {
  private readonly page: Page;
  readonly coldMigrationRadio: Locator;
  readonly warmMigrationRadio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.coldMigrationRadio = page.getByTestId('migration-type-cold');
    this.warmMigrationRadio = page.getByTestId('migration-type-warm');
  }

  get cbtWarningAlert(): Locator {
    return this.page.getByText('Must enable Changed Block Tracking (CBT) for warm migration');
  }

  async fillAndComplete(migrationType?: PlanTestData['migrationType']): Promise<void> {
    if (migrationType) {
      await this.selectMigrationType(migrationType);
    }
  }

  async selectMigrationType(migrationType: PlanTestData['migrationType']): Promise<void> {
    if (migrationType === MigrationType.COLD) {
      await this.coldMigrationRadio.click();
    } else if (migrationType === MigrationType.WARM) {
      await this.warmMigrationRadio.click();
    }
  }

  get vddkWarningAlert(): Locator {
    return this.page.getByText('Must enable VMware Virtual Disk Development Kit');
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Migration type' })).toBeVisible();
  }
}

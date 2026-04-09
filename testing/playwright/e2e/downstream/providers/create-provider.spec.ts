import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import { hasProviderConfig } from '../../../utils/providers';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_10_5, V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

import { createProviderData, providerTestScenarios } from './creation-scenarios';

const DUMMY_SMB_URL = '//server/share';
const DUMMY_HOST = 'host.example.com';

test.describe('Provider Creation Tests', () => {
  requireVersion(test, V2_10_5);

  const resourceManager = new ResourceManager();

  providerTestScenarios.forEach(
    ({ scenarioName, providerType, providerKey, providerDataOverrides, minVersion }) => {
      test(
        `should create a new ${providerType} provider: ${scenarioName}`,
        {
          tag: '@downstream',
        },
        async ({ page }) => {
          if (minVersion) {
            requireVersion(test, minVersion);
          }
          test.skip(
            !hasProviderConfig(providerKey),
            `Provider config '${providerKey}' not found in .providers.json`,
          );
          test.setTimeout(240000);
          const createProvider = new CreateProviderPage(page, resourceManager);
          const testProviderData = createProviderData(
            providerType,
            providerKey,
            providerDataOverrides,
          );

          await test.step('Navigate to provider creation page', async () => {
            await createProvider.navigate();
          });

          await test.step('Create provider', async () => {
            await createProvider.create(testProviderData, true);
          });

          await test.step('Verify provider resource', async () => {
            const providerResource = await resourceManager.fetchProvider(
              page,
              testProviderData.name,
            );
            expect(providerResource).not.toBeNull();
            expect(providerResource?.spec?.type).toBe(providerType);

            if (testProviderData.useVddkAioOptimization) {
              expect(providerResource?.spec?.settings?.useVddkAioOptimization).toBe('true');
            }
            if (!testProviderData.useVddkAioOptimization) {
              const aioValue = providerResource?.spec?.settings?.useVddkAioOptimization;
              expect(aioValue === undefined || aioValue === 'false').toBe(true);
            }
          });
        },
      );
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });

  test(
    'should verify Skip VDDK Setup and Skip Certificate Validation options for vSphere provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page, resourceManager);

      await test.step('Navigate to provider creation page', async () => {
        await createProvider.navigate();
      });

      await test.step('Select VMware vSphere provider type', async () => {
        await createProvider.selectProviderType(ProviderType.VSPHERE);
      });

      await test.step('Verify AIO checkbox is visible when VDDK is configured manually', async () => {
        await createProvider.vddkManualRadio.click();
        await expect(createProvider.vddkManualRadio).toBeChecked();
        await expect(createProvider.vddkAioCheckbox).toBeVisible();
        await expect(createProvider.vddkImageInput).toBeVisible();
      });

      await test.step('Click Skip VDDK setup and verify warning and hidden AIO checkbox', async () => {
        await createProvider.vddkSkipRadio.click();
        await expect(createProvider.vddkSkipRadio).toBeChecked();
        await expect(createProvider.vddkSkipWarning).toBeVisible();
        await expect(createProvider.vddkAioCheckbox).not.toBeVisible();
        await expect(createProvider.vddkImageInput).not.toBeVisible();
      });

      await test.step('Verify CA certificate section is visible by default', async () => {
        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).toBeVisible();
      });

      await test.step('Click Skip certificate validation and verify CA certificate section is hidden', async () => {
        await createProvider.certificateSkipRadio.click();
        await expect(createProvider.certificateSkipRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).not.toBeVisible();
      });
    },
  );

  test(
    'should display all Hyper-V form fields and toggle SMB credentials',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate to provider creation page', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
      });

      await test.step('Select Hyper-V provider type', async () => {
        await createProvider.selectProviderType(ProviderType.HYPERV);
      });

      await test.step('Verify SMB share URL field is visible', async () => {
        await expect(page.locator('#smbUrl')).toBeVisible();
      });

      await test.step('Verify credential fields are hidden before SMB URL is filled', async () => {
        await expect(page.getByTestId('hyperv-host-input')).not.toBeVisible();
        await expect(page.getByTestId('hyperv-username-input')).not.toBeVisible();
        await expect(page.getByTestId('hyperv-password-input')).not.toBeVisible();
      });

      await test.step('Fill SMB URL and verify credential fields appear', async () => {
        await page.locator('#smbUrl').fill(DUMMY_SMB_URL);
        await expect(page.getByTestId('hyperv-host-input')).toBeVisible();
        await expect(page.getByTestId('hyperv-username-input')).toBeVisible();
        await expect(page.getByTestId('hyperv-password-input')).toBeVisible();
      });

      await test.step('Verify SMB credentials checkbox is visible and unchecked', async () => {
        const smbCheckbox = page.locator('#useDifferentSmbCredentials');
        await expect(smbCheckbox).toBeVisible();
        await expect(smbCheckbox).not.toBeChecked();
      });

      await test.step('Verify SMB credential fields hidden by default', async () => {
        await expect(page.getByTestId('smb-user-input')).not.toBeVisible();
        await expect(page.getByTestId('smb-password-input')).not.toBeVisible();
      });

      await test.step('Check SMB credentials checkbox and verify fields appear', async () => {
        await page.locator('#useDifferentSmbCredentials').click();
        await expect(page.getByTestId('smb-user-input')).toBeVisible();
        await expect(page.getByTestId('smb-password-input')).toBeVisible();
      });

      await test.step('Uncheck SMB credentials checkbox and verify fields hidden', async () => {
        await page.locator('#useDifferentSmbCredentials').click();
        await expect(page.getByTestId('smb-user-input')).not.toBeVisible();
        await expect(page.getByTestId('smb-password-input')).not.toBeVisible();
      });
    },
  );

  test(
    'should validate required fields for Hyper-V provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate to provider creation page', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
      });

      await test.step('Select Hyper-V provider type and skip certificate', async () => {
        await createProvider.selectProviderType(ProviderType.HYPERV);
        await createProvider.certificateSkipRadio.click();
      });

      await test.step('Verify create button is disabled when fields are empty', async () => {
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill all required fields progressively until enabled', async () => {
        await createProvider.fillProviderName('test-validation');
        await expect(createProvider.createButton).toBeDisabled();

        // SMB URL must be filled first to reveal credential fields
        await page.locator('#smbUrl').fill(DUMMY_SMB_URL);
        await page.getByTestId('hyperv-host-input').waitFor({ state: 'visible', timeout: 10000 });
        await expect(createProvider.createButton).toBeDisabled();

        await page.getByTestId('hyperv-host-input').fill(DUMMY_HOST);
        await expect(createProvider.createButton).toBeDisabled();

        await page.getByTestId('hyperv-username-input').fill('admin');
        await expect(createProvider.createButton).toBeDisabled();

        await page.getByTestId('hyperv-password-input').fill('password123');
        await expect(createProvider.createButton).toBeEnabled();
      });
    },
  );

  test(
    'should validate SMB URL format for Hyper-V provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate and select Hyper-V', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.HYPERV);
      });

      await test.step('Enter invalid SMB path and verify error', async () => {
        await page.locator('#smbUrl').fill('invalid-path');
        await page.locator('#smbUrl').blur();
        await expect(page.getByText('SMB path must be in format')).toBeVisible();
      });

      await test.step('Enter valid SMB path and verify error clears', async () => {
        await page.locator('#smbUrl').fill('//server/share');
        await page.locator('#smbUrl').blur();
        await expect(page.getByText('SMB path must be in format')).not.toBeVisible();
      });
    },
  );

  test(
    'should verify certificate validation options for Hyper-V provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate and select Hyper-V', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.HYPERV);
      });

      await test.step('Verify certificate configure is default with upload visible', async () => {
        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).toBeVisible();
      });

      await test.step('Switch to skip and verify upload hidden', async () => {
        await createProvider.certificateSkipRadio.click();
        await expect(createProvider.certificateSkipRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).not.toBeVisible();
      });

      await test.step('Switch back to configure and verify upload visible', async () => {
        await createProvider.certificateConfigureRadio.click();
        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await expect(createProvider.certificateUploadInput).toBeVisible();
      });
    },
  );

  test(
    'should require SMB credentials when separate credentials checkbox is checked',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_11_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate and fill all base Hyper-V fields', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.HYPERV);
        await createProvider.fillProviderName('test-smb-creds');
        // SMB URL must be filled first to reveal credential fields
        await page.locator('#smbUrl').fill(DUMMY_SMB_URL);
        await page.getByTestId('hyperv-host-input').waitFor({ state: 'visible', timeout: 10000 });
        await page.getByTestId('hyperv-host-input').fill(DUMMY_HOST);
        await page.getByTestId('hyperv-username-input').fill('admin');
        await page.getByTestId('hyperv-password-input').fill('password');
        await createProvider.certificateSkipRadio.click();
      });

      await test.step('Verify button is enabled without separate SMB creds', async () => {
        await expect(createProvider.createButton).toBeEnabled();
      });

      await test.step('Check different SMB credentials and verify button disabled', async () => {
        await page.locator('#useDifferentSmbCredentials').click();
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill SMB username only — still disabled', async () => {
        await page.getByTestId('smb-user-input').fill('smb-user');
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill SMB password — button becomes enabled', async () => {
        await page.getByTestId('smb-password-input').fill('smb-pass');
        await expect(createProvider.createButton).toBeEnabled();
      });
    },
  );
});

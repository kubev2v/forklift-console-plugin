import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { ProviderType } from '../../../types/enums';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_11_0, V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

import { createProviderData } from './creation-scenarios';

const VSPHERE_KEY = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
const INVALID_CERTIFICATE = 'this-is-not-a-valid-pem-certificate';
const BEGIN_CERTIFICATE = '-----BEGIN CERTIFICATE-----';

test.describe('vSphere Provider Certificate Validation', () => {
  requireVersion(test, V2_11_0);

  const resourceManager = new ResourceManager();

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });

  test(
    'should create provider with certificate fetched from URL and reuse it via text input',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);
      const providerDetailsPage = new ProviderDetailsPage(page);
      let fetchedCertificate = '';

      await test.step('Create provider with certificate fetched from URL', async () => {
        const testData = createProviderData(ProviderType.VSPHERE, VSPHERE_KEY, {
          skipVddk: true,
        });

        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.fillProviderFields(testData);

        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await expect(createProvider.fetchCertificateButton).toBeVisible();
        await createProvider.fetchCertificateButton.click();

        const { verifyCertificateModal } = createProvider;
        await verifyCertificateModal.waitForModalToOpen();
        await verifyCertificateModal.verifyCertificateDetails();

        const issuer = await verifyCertificateModal.getIssuer();
        const fingerprint = await verifyCertificateModal.getFingerprint();
        const expirationDate = await verifyCertificateModal.getExpirationDate();
        expect(issuer).toBeTruthy();
        expect(fingerprint).toBeTruthy();
        expect(expirationDate).toBeTruthy();

        await verifyCertificateModal.verifySaveButtonDisabled();
        await verifyCertificateModal.trustAndSave();

        fetchedCertificate = await createProvider.getCaCertificateValue();
        expect(fetchedCertificate).toContain(BEGIN_CERTIFICATE);

        await createProvider.submitCreateForm(testData.name, MTV_NAMESPACE);
        await providerDetailsPage.waitForPageLoad();
        await providerDetailsPage.verifyProviderTitle(testData.name);
      });

      await test.step('Create provider with certificate uploaded from text', async () => {
        expect(fetchedCertificate).toContain(BEGIN_CERTIFICATE);
        const testData = createProviderData(ProviderType.VSPHERE, VSPHERE_KEY, {
          skipVddk: true,
        });

        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.fillProviderFields(testData);

        await expect(createProvider.certificateConfigureRadio).toBeChecked();
        await createProvider.enterCaCertificate(fetchedCertificate);

        const currentValue = await createProvider.getCaCertificateValue();
        expect(currentValue).toBe(fetchedCertificate);

        await createProvider.submitCreateForm(testData.name, MTV_NAMESPACE);
        await providerDetailsPage.waitForPageLoad();
        await providerDetailsPage.verifyProviderTitle(testData.name);
      });
    },
  );

  test(
    'should show error when invalid certificate is provided',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_12_0);

      const createProvider = new CreateProviderPage(page, resourceManager);
      const testData = createProviderData(ProviderType.VSPHERE, VSPHERE_KEY, {
        skipVddk: true,
      });

      await createProvider.navigate();
      await createProvider.waitForWizardLoad();
      await createProvider.fillProviderFields(testData);

      await expect(createProvider.certificateConfigureRadio).toBeChecked();
      await createProvider.enterCaCertificate(INVALID_CERTIFICATE);

      await expect(createProvider.caCertificateErrorText).toContainText(
        'The CA certificate is not valid',
      );
      await expect(createProvider.createButton).toBeDisabled();
    },
  );
});

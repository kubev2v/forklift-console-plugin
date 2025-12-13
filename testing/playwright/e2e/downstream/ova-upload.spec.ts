import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, type Page } from '@playwright/test';

import type { ConfigurableResourceFixtures } from '../../fixtures/resourceFixtures';
import { isolatedCustomPlanFixtures as test } from '../../fixtures/resourceFixtures';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { NfsCleanupManager } from '../../utils/nfs-cleanup/NfsCleanupManager';

test.describe('OVA Provider Upload Tests', { tag: '@downstream' }, () => {
  const nfsCleanupManager = new NfsCleanupManager();
  let createdOvaPath: string | null = null;

  test.afterAll(async () => {
    // Cleanup: Delete uploaded OVA files from NFS server
    await nfsCleanupManager.instantCleanup().catch((error) => {
      console.error('NFS cleanup failed:', error);
    });

    // Cleanup: Delete local temporary OVA file
    if (createdOvaPath) {
      await rm(createdOvaPath, { force: true }).catch((error) => {
        console.error('Local OVA cleanup failed:', error);
      });
    }
  });

  test('should create OVA provider with applianceManagement enabled and validate upload form', async ({
    page,
    createProviderFromKey,
  }: ConfigurableResourceFixtures & { page: Page }) => {
    let ovaProvider: any = null;
    const providerDetailsPage = new ProviderDetailsPage(page);

    // Generate unique VM name (must be same length as original '2nd-disk-vm' = 11 chars)
    const uniqueId = crypto.randomUUID().substring(0, 6);
    const baseOvaFileName = '2nd_disk';
    const uniqueOvaFileName = `test-${baseOvaFileName}-${uniqueId}.ova`;
    const vmName = `test-${uniqueId}`;
    const ORIGINAL_VM_NAME = '2nd-disk-vm';

    // Paths for original and modified OVA
    const testAssetsDir = join(__dirname, '../../test-assets/ova-files');
    const originalOvaPath = join(testAssetsDir, `${baseOvaFileName}.ova`);
    const uniqueOvaPath = join(testAssetsDir, uniqueOvaFileName);

    // Simple byte replacement: copy original, then replace VM name in-place
    copyFileSync(originalOvaPath, uniqueOvaPath);

    const ovaContent = readFileSync(uniqueOvaPath);
    const searchBuffer = Buffer.from(ORIGINAL_VM_NAME, 'utf8');
    const replaceBuffer = Buffer.from(vmName, 'utf8');

    // Find and replace all occurrences
    let pos = 0;
    while ((pos = ovaContent.indexOf(searchBuffer, pos)) !== -1) {
      replaceBuffer.copy(ovaContent, pos);
      pos += searchBuffer.length;
    }

    writeFileSync(uniqueOvaPath, ovaContent);
    createdOvaPath = uniqueOvaPath; // Track for cleanup

    await test.step('Create OVA provider using provider key', async () => {
      const ovaProviderKey = process.env.OVA_PROVIDER ?? 'ova';
      ovaProvider = await createProviderFromKey(ovaProviderKey, 'test-ova-upload');
      expect(ovaProvider.metadata.name).toContain('test-ova-upload');
    });

    await test.step('Navigate to provider details page', async () => {
      await providerDetailsPage.navigate(ovaProvider.metadata.name, ovaProvider.metadata.namespace);
      await providerDetailsPage.waitForReadyStatus();
    });

    await test.step('Verify the upload section is visible', async () => {
      await expect(providerDetailsPage.detailsTab.uploadSectionHeading).toBeVisible();
    });

    await test.step('Verify upload form elements are present', async () => {
      await expect(providerDetailsPage.detailsTab.fileUploadInput).toBeVisible();
      await expect(providerDetailsPage.detailsTab.uploadButton).toBeDisabled();
    });

    await test.step('Upload OVA file and verify success', async () => {
      await providerDetailsPage.detailsTab.selectOvaFile(uniqueOvaPath);
      await expect(providerDetailsPage.detailsTab.uploadButton).toBeEnabled();
      await providerDetailsPage.detailsTab.clickUploadButton();

      // Register the uploaded file for cleanup using provider's NFS URL
      const nfsUrl = ovaProvider.testData?.hostname;
      nfsCleanupManager.addOvaFileFromUrl(uniqueOvaFileName, nfsUrl);

      // Wait for either success or error alert
      const { successAlert, errorAlert } = providerDetailsPage.detailsTab;

      // Race between success and error alerts
      const result = await Promise.race([
        successAlert.waitFor({ state: 'visible' }).then(() => 'success'),
        errorAlert.waitFor({ state: 'visible' }).then(() => 'error'),
      ]).catch(() => 'timeout');

      if (result === 'error') {
        const errorMessage = await errorAlert.textContent();
        throw new Error(`Upload failed with error: ${errorMessage}`);
      } else if (result === 'timeout') {
        throw new Error('Upload timeout: Neither success nor error alert appeared');
      }

      // Verify success alert is visible
      await expect(successAlert).toBeVisible();
    });

    await test.step('Upload same OVA file again and verify error', async () => {
      await providerDetailsPage.detailsTab.selectOvaFile(uniqueOvaPath);
      await expect(providerDetailsPage.detailsTab.uploadButton).toBeEnabled();
      await providerDetailsPage.detailsTab.clickUploadButton();
      await expect(providerDetailsPage.detailsTab.errorAlert).toBeVisible();
      await expect(providerDetailsPage.detailsTab.errorAlert).toContainText(/already exists/i);
    });

    await test.step('Verify uploaded VM appears in Virtual Machines tab', async () => {
      // Navigate to Virtual Machines tab
      await providerDetailsPage.navigateToVirtualMachinesTab();
      await providerDetailsPage.virtualMachinesTab.waitForTableLoad();

      console.log('Verifying VM exists on NFS server:', vmName);
      // Verify the VM from the uploaded OVA file appears (can take up to 2 minutes)
      await expect(async () => {
        await providerDetailsPage.virtualMachinesTab.verifyVMExists(vmName);
      }).toPass({
        timeout: 120_000,
        intervals: [5_000],
      });
    });
  });
});

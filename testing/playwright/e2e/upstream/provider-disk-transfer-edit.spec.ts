import { expect, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VDDK_IMAGE = 'quay.io/example/vddk:latest';
const { source } = TEST_DATA.providers;

test.describe('Provider disk transfer edit', { tag: '@upstream' }, () => {
  requireVersion(test, V2_12_0);

  test('prefills a stored VDDK image and switches methods without saving', async ({ page }) => {
    await setupForkliftIntercepts(page);
    await page.route(
      '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/forkliftcontrollers*',
      async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            items: [
              {
                apiVersion: 'forklift.konveyor.io/v1beta1',
                kind: 'ForkliftController',
                metadata: { name: 'forklift-controller', namespace: 'konveyor-forklift' },
                // eslint-disable-next-line camelcase
                spec: { feature_copy_appliance: false },
              },
            ],
            kind: 'ForkliftControllerList',
            metadata: { resourceVersion: '1' },
          }),
          contentType: 'application/json',
          status: 200,
        });
      },
    );
    await page.route(
      `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/providers/${source.name}*`,
      async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: source.name,
              namespace: MTV_NAMESPACE,
              resourceVersion: '1',
              uid: source.uid,
            },
            spec: {
              settings: {
                sdkEndpoint: 'vcenter',
                useVddkAioOptimization: 'true',
                vddkInitImage: VDDK_IMAGE,
              },
              type: source.type,
              url: source.url,
            },
            status: { conditions: [{ status: 'True', type: 'Ready' }], phase: 'Ready' },
          }),
          contentType: 'application/json',
          status: 200,
        });
      },
    );

    const providerDetailsPage = new ProviderDetailsPage(page);
    await providerDetailsPage.navigate(source.name, MTV_NAMESPACE);

    const editButton = page.getByTestId('disk-transfer-edit-button');
    const hasDiskTransferEdit = await editButton
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!hasDiskTransferEdit, 'The deployed plugin does not include MTV-6963 yet.');

    await expect(page.getByTestId('disk-transfer-method')).toContainText('VDDK image');
    await expect(page.getByTestId('disk-transfer-vddk-image')).toContainText(VDDK_IMAGE);
    await expect(editButton).toBeEnabled();
    await editButton.click();

    const modal = page.getByTestId('edit-disk-transfer-modal');
    await expect(modal.getByTestId('disk-transfer-configure-radio')).toBeChecked();
    await expect(modal.getByTestId('disk-transfer-method-toggle')).toContainText(
      'Specify a VDDK image URL',
    );
    await expect(modal.getByTestId('vsphere-vddk-image-input')).toHaveValue(VDDK_IMAGE);
    await expect(modal.getByTestId('vddk-aio-optimization-checkbox')).toBeChecked();

    await modal.getByTestId('vddk-setup-skip-radio').click();
    await expect(modal.getByTestId('disk-transfer-method-toggle')).not.toBeVisible();
    await modal.getByTestId('disk-transfer-configure-radio').click();
    await expect(modal.getByTestId('vsphere-vddk-image-input')).toHaveValue(VDDK_IMAGE);

    await modal.getByTestId('disk-transfer-method-toggle').click();
    await page.getByRole('option', { name: 'Upload a VDDK archive' }).click();
    await expect(modal.getByText('VDDK init image archive')).toBeVisible();
    await modal.getByTestId('modal-cancel-button').click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId('disk-transfer-vddk-image')).toContainText(VDDK_IMAGE);
  });
});

import { expect, test } from '@playwright/test';

import { setupForkliftIntercepts } from '../../intercepts';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { disableGuidedTour } from '../../utils/utils';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

// EC2 is excluded: its dropdown option is gated behind useClusterIsAwsPlatform(),
// which requires a real Infrastructure resource that upstream mocks cannot provide.
// EC2 pre-selection is covered by downstream tests instead.
const PROVIDER_TYPE_LABELS: Record<string, string> = {
  ec2: 'Amazon EC2',
  hyperv: 'Microsoft Hyper-V',
  openshift: 'OpenShift Virtualization',
  openstack: 'OpenStack',
  ova: 'Open Virtual Appliance',
  ovirt: 'Red Hat Virtualization',
  vsphere: 'VMware vSphere',
};

test.describe(
  'Provider Type Pre-selection from URL',
  {
    tag: '@upstream',
  },
  () => {
    requireVersion(test, V2_12_0);
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
    });

    for (const [providerType, expectedLabel] of Object.entries(PROVIDER_TYPE_LABELS)) {
      test(`should pre-select ${expectedLabel} when providerType=${providerType} is in URL`, async ({
        page,
      }) => {
        const createProviderPage = new CreateProviderPage(page);

        await test.step('Navigate to create provider page with providerType URL param', async () => {
          await createProviderPage.navigateWithProviderType(providerType);
          await disableGuidedTour(page);
        });

        await test.step('Verify provider type is pre-selected in the dropdown', async () => {
          const toggle = createProviderPage.getProviderTypeToggle();
          await toggle.waitFor({ state: 'visible', timeout: 10000 });
          await expect(toggle).toHaveText(expectedLabel);
        });
      });
    }

    test('should show placeholder when providerType URL param is invalid', async ({ page }) => {
      const createProviderPage = new CreateProviderPage(page);

      await test.step('Navigate to create provider page with invalid providerType', async () => {
        await createProviderPage.navigateWithProviderType('invalid-type');
        await disableGuidedTour(page);
      });

      await test.step('Verify placeholder is shown instead of a provider type', async () => {
        const toggle = createProviderPage.getProviderTypeToggle();
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await expect(toggle).toHaveText('Select a provider type');
      });
    });

    test('should show placeholder when no providerType URL param is present', async ({ page }) => {
      const createProviderPage = new CreateProviderPage(page);

      await test.step('Navigate to create provider page without providerType param', async () => {
        await page.goto('/k8s/cluster/forklift.konveyor.io~v1beta1~Provider/~new');
        await page.waitForLoadState('networkidle');
        await disableGuidedTour(page);
      });

      await test.step('Verify placeholder is shown', async () => {
        const toggle = createProviderPage.getProviderTypeToggle();
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await expect(toggle).toHaveText('Select a provider type');
      });
    });
  },
);

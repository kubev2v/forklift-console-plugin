import { expect, type Page, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts, setupMigrationVmResourceIntercepts } from '../../intercepts';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

/**
 * MTV-5509 / MTV-5507 — "Post-Migration Setup" phase in the migration progress UI.
 *
 * Fixture-driven (no live cluster / real Windows VM needed): mocks a Plan whose
 * `status.migration.vms[0].pipeline` has the backend's `WaitForGuestReboots` step
 * `Running`, which is what the UI renders while a migrated Windows VM is still
 * rebooting to finish driver installation.
 *
 * See docs/test-report-mtv-5509-post-migration-setup.md for the live-cluster
 * exploration this spec formalizes into a fast, repeatable regression test.
 */

const WINDOWS_VM_ID = 'vm-win-1';
const WINDOWS_VM_NAME = 'test-windows-vm';
const LINUX_VM_ID = 'vm-linux-1';
const LINUX_VM_NAME = 'test-linux-vm';

const MILLISECONDS_PER_MINUTE = 60_000;
const MIGRATION_STARTED_MINUTES_AGO = 12;
const VM_CREATED_MINUTES_AGO = 3;

const buildMockPlan = (): object => {
  const started = new Date(
    Date.now() - MIGRATION_STARTED_MINUTES_AGO * MILLISECONDS_PER_MINUTE,
  ).toISOString();
  const vmCreatedAt = new Date(
    Date.now() - VM_CREATED_MINUTES_AGO * MILLISECONDS_PER_MINUTE,
  ).toISOString();

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      creationTimestamp: new Date().toISOString(),
      name: TEST_DATA.planName,
      namespace: MTV_NAMESPACE,
      resourceVersion: '999999',
      uid: 'test-plan-uid-1',
    },
    spec: {
      migrateSharedDisks: false,
      provider: {
        destination: { name: TEST_DATA.providers.target.name, namespace: MTV_NAMESPACE },
        source: { name: TEST_DATA.providers.source.name, namespace: MTV_NAMESPACE },
      },
      pvcNameTemplateUseGenerateName: true,
      skipGuestConversion: false,
      targetNamespace: TEST_DATA.targetProject,
      vms: [
        { id: WINDOWS_VM_ID, name: WINDOWS_VM_NAME },
        { id: LINUX_VM_ID, name: LINUX_VM_NAME },
      ],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Advisory',
          lastTransitionTime: new Date().toISOString(),
          message: 'The plan is executing.',
          reason: 'ExecutionInProgress',
          status: 'True',
          type: 'Executing',
        },
      ],
      migration: {
        vms: [
          {
            id: WINDOWS_VM_ID,
            name: WINDOWS_VM_NAME,
            pipeline: [
              { completed: started, name: 'Initialize', phase: 'Completed' },
              { completed: started, name: 'DiskTransfer', phase: 'Completed' },
              { completed: vmCreatedAt, name: 'VirtualMachineCreation', phase: 'Completed' },
              {
                description: 'Waiting for guest reboots to complete',
                name: 'WaitForGuestReboots',
                phase: 'Running',
              },
              { name: 'PostHook', phase: 'Pending' },
            ],
            started,
          },
          {
            // A second, unrelated VM ("Running", not post-migration setup) so the
            // "Pipeline status" filter test can prove real filtering by asserting
            // this VM is excluded, rather than the filter being a no-op.
            id: LINUX_VM_ID,
            name: LINUX_VM_NAME,
            pipeline: [
              { completed: started, name: 'Initialize', phase: 'Completed' },
              { name: 'DiskTransfer', phase: 'Running' },
            ],
            started,
          },
        ],
      },
    },
  };
};

/**
 * Overrides the baseline `setupPlansIntercepts` plan routes (GET, watch, and
 * fieldSelector variants) for `TEST_DATA.planName` with a plan whose migration
 * status has a VM in the `WaitForGuestReboots` ("Post-migration setup") phase.
 * Playwright resolves overlapping `page.route` handlers most-recently-registered
 * first, so calling this after `setupForkliftIntercepts` makes it take priority.
 */
const setupPostMigrationSetupPlanOverride = async (page: Page): Promise<void> => {
  const mockPlan = buildMockPlan();
  const planByNameUrl = `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/plans/${TEST_DATA.planName}`;

  await page.route(planByNameUrl, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify(mockPlan),
        contentType: 'application/json',
        status: 200,
      });
    } else {
      await route.continue();
    }
  });

  await page.route(`**/namespaces/${MTV_NAMESPACE}/plans?watch=true**`, async (route) => {
    const url = route.request().url();
    if (url.includes(TEST_DATA.planName) || url.includes('fieldSelector')) {
      await route.fulfill({
        body: JSON.stringify({ object: mockPlan, type: 'ADDED' }),
        contentType: 'application/json',
        status: 200,
      });
    } else {
      await route.continue();
    }
  });

  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/plans?**`,
    async (route) => {
      const url = route.request().url();
      if (url.includes(TEST_DATA.planName) && route.request().method() === 'GET') {
        await route.fulfill({
          body: JSON.stringify(mockPlan),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );
};

test.describe('Plan Virtual Machines — Post-Migration Setup status', { tag: '@upstream' }, () => {
  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
    await setupMigrationVmResourceIntercepts(page);
    await setupPostMigrationSetupPlanOverride(page);
  });

  test('shows the Post-migration setup pipeline step, warning alert, filter option, and suppresses the VM link while WaitForGuestReboots is running', async ({
    page,
  }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    const { virtualMachinesTab } = planDetailsPage;

    await test.step('Navigate to the plan Virtual machines tab', async () => {
      await planDetailsPage.navigate(TEST_DATA.planName, MTV_NAMESPACE);
      await virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('VM row is visible but its name is not a navigable link', async () => {
      await virtualMachinesTab.verifyRowIsVisible({ Name: WINDOWS_VM_NAME });
      await expect(page.getByRole('link', { name: WINDOWS_VM_NAME, exact: true })).toHaveCount(0);
      await expect(page.getByText(WINDOWS_VM_NAME, { exact: true })).toBeVisible();
    });

    await test.step('"Pipeline status" filter offers "Post-migration setup" and filtering excludes non-matching VMs', async () => {
      await virtualMachinesTab.verifyRowIsVisible({ Name: LINUX_VM_NAME });

      await virtualMachinesTab.verifyPrimaryFilterValues('status', ['Post-migration setup']);
      await virtualMachinesTab.applyPrimaryFilter('status', 'Post-migration setup');

      await virtualMachinesTab.verifyRowIsVisible({ Name: WINDOWS_VM_NAME });
      await expect(page.getByText(LINUX_VM_NAME, { exact: true })).toHaveCount(0);

      await virtualMachinesTab.clearFilters();
      await virtualMachinesTab.verifyRowIsVisible({ Name: LINUX_VM_NAME });
    });

    await test.step('Expanded pipeline table shows the "Post-migration setup" step and warning alert', async () => {
      // Narrow to the Windows VM so "first" row is unambiguous now that the fixture
      // has two VMs.
      await virtualMachinesTab.search(WINDOWS_VM_NAME);
      await virtualMachinesTab.expandFirstVMDetailsRow();
      await expect(page.getByText('Post-migration setup', { exact: true })).toBeVisible();
      await expect(page.getByText('Do not access this VM')).toBeVisible();
      await expect(
        page.getByText(/installing drivers and completing post-migration setup/iu),
      ).toBeVisible();
    });
  });

  test('[Known bug] "Pipeline status" column text should read "Post-migration setup" while WaitForGuestReboots is running', async ({
    page,
  }) => {
    // MTV-6278: MigrationStatusLabel reads a stale duplicate of getVMMigrationStatus that lacks
    // the isPostMigrationSetup branch, so it falls through to "Running". Remove test.fail() once
    // MTV-6278 lands.
    test.fail(true, 'Known bug MTV-6278 — filed as a follow-up to MTV-5509/MTV-5507');

    const planDetailsPage = new PlanDetailsPage(page);
    const { virtualMachinesTab } = planDetailsPage;

    await planDetailsPage.navigate(TEST_DATA.planName, MTV_NAMESPACE);
    await virtualMachinesTab.navigateToVirtualMachinesTab();

    const statusCell = await virtualMachinesTab.getTableCell(
      'Name',
      WINDOWS_VM_NAME,
      'Pipeline status',
    );
    await expect(statusCell).toContainText('Post-migration setup');
  });
});

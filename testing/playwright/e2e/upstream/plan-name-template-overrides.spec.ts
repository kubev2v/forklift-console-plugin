import { expect, type Locator, type Page, test } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

// MTV-4056 — plan-level PVC/Volume/Network name templates can be overridden per VM.
// Settings rows surface an info popover listing overriding VMs; the Edit VM wizard
// shows whether each VM uses the plan default or a custom template.

const VM1_NAME = 'test-virtual-machine-1';
const VM2_NAME = 'test-virtual-machine-2';

const VM1_PVC_TEMPLATE = 'pvc-{{.VmName}}';
const VM1_VOLUME_TEMPLATE = 'vol-{{.VolumeIndex}}';
const VM2_PVC_TEMPLATE = 'pvc-override-2';
const VM2_NETWORK_TEMPLATE = 'net-{{.NetworkIndex}}';

type InventoryVmFixture = (typeof TEST_DATA.virtualMachines)[number];

const NAME_TEMPLATE_OVERRIDE_INVENTORY_VMS: InventoryVmFixture[] = [
  ...TEST_DATA.virtualMachines,
  {
    cluster: 'test-cluster-1',
    cpuCores: 2,
    cpuSockets: 2,
    host: 'test-host-1',
    id: 'test-vm-2',
    memory: 4294967296,
    name: VM2_NAME,
    osType: 'linux',
    status: 'down',
  },
];

const buildInventoryVmResponse = (vm: InventoryVmFixture): object => ({
  cluster: vm.cluster,
  concerns: [],
  cpuCores: vm.cpuCores,
  cpuSockets: vm.cpuSockets,
  diskAttachments: [
    {
      bootable: true,
      disk: 'test-disk-1',
      id: 'test-disk-1',
      interface: 'virtio_scsi',
      scsiReservation: false,
    },
  ],
  guestName: `${vm.name} Guest`,
  host: vm.host,
  id: vm.id,
  isTemplate: false,
  memory: vm.memory,
  name: vm.name,
  nics: [
    {
      id: 'test-nic-1',
      interface: 'virtio',
      ipAddress: '',
      mac: '00:12:4a:16:37:2d',
      name: 'nic1',
      plugged: true,
    },
  ],
  osType: vm.osType,
  parent: {
    id: 'test-folder-1',
    kind: 'Folder',
  },
  path: `L0_Group_Test/${vm.name}`,
  policyVersion: 6,
  revision: 1,
  revisionValidated: 1,
  selfLink: `providers/test/${vm.id}`,
  status: vm.status,
});

const buildMockPlan = (): object => ({
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
      {
        id: 'test-vm-1',
        name: VM1_NAME,
        pvcNameTemplate: VM1_PVC_TEMPLATE,
        volumeNameTemplate: VM1_VOLUME_TEMPLATE,
      },
      {
        id: 'test-vm-2',
        name: VM2_NAME,
        networkNameTemplate: VM2_NETWORK_TEMPLATE,
        pvcNameTemplate: VM2_PVC_TEMPLATE,
      },
    ],
    warm: false,
  },
  status: {
    conditions: [
      {
        category: 'Advisory',
        lastTransitionTime: new Date().toISOString(),
        message: 'The plan is ready.',
        reason: 'Ready',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
});

const setupNameTemplateOverridePlanOverride = async (page: Page): Promise<void> => {
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

  const inventoryVmsEndpoint = API_ENDPOINTS.virtualMachines(
    'vsphere',
    TEST_DATA.providers.source.uid,
  );

  await page.route(inventoryVmsEndpoint, async (route) => {
    await route.fulfill({
      body: JSON.stringify(
        NAME_TEMPLATE_OVERRIDE_INVENTORY_VMS.map((vm) => buildInventoryVmResponse(vm)),
      ),
      contentType: 'application/json',
      status: 200,
    });
  });
};

const verifyOverridePopover = async (
  page: Page,
  templateType: 'pvc' | 'volume' | 'network',
  expectedVmNames: string[],
): Promise<void> => {
  const trigger = page.getByTestId(`name-template-override-trigger-${templateType}`);
  await expect(trigger).toBeVisible();
  await trigger.click();

  const popover = page.getByTestId(`name-template-override-popover-${templateType}`);
  await expect(popover).toBeVisible();
  await expect(popover).toContainText('Custom name templates');
  await expect(popover).toContainText('The following virtual machines override this plan setting:');

  for (const vmName of expectedVmNames) {
    await expect(popover).toContainText(vmName);
  }

  await expect(page.getByTestId(`name-template-override-apply-${templateType}`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
};

const verifyVmNameTemplateSelection = async (
  namingTemplatesStep: Locator,
  fieldId: 'pvcNameTemplate' | 'volumeNameTemplate' | 'networkNameTemplate',
  expectedTemplate?: string,
): Promise<void> => {
  if (expectedTemplate === undefined) {
    await expect(namingTemplatesStep.getByTestId(`${fieldId}-inherit-radio`)).toBeChecked();
    await expect(namingTemplatesStep.getByTestId(`${fieldId}-input`)).toBeHidden();
    return;
  }

  await expect(namingTemplatesStep.getByTestId(`${fieldId}-override-radio`)).toBeChecked();
  await expect(namingTemplatesStep.getByTestId(`${fieldId}-input`)).toHaveValue(expectedTemplate);
};

test.describe('Plan name template overrides', { tag: '@upstream' }, () => {
  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
    await setupNameTemplateOverridePlanOverride(page);
  });

  test('shows Settings override popovers and VM wizard selections for custom templates', async ({
    page,
  }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    const { settingsTab, virtualMachinesTab } = planDetailsPage;

    await test.step('Navigate to the plan Settings tab (Naming section)', async () => {
      await planDetailsPage.navigate(TEST_DATA.planName, MTV_NAMESPACE);
      await settingsTab.navigateToSettingsTab();
      await settingsTab.selectSettingsSection('naming');
      await planDetailsPage.waitForPlanEditable();
    });

    await test.step('Settings rows show info icons with overriding VM lists', async () => {
      await verifyOverridePopover(page, 'pvc', [VM1_NAME, VM2_NAME]);
      await verifyOverridePopover(page, 'volume', [VM1_NAME]);
      await verifyOverridePopover(page, 'network', [VM2_NAME]);
    });

    await test.step('Edit VM wizard shows custom vs inherited template selections', async () => {
      await virtualMachinesTab.navigateToVirtualMachinesTab();

      const wizard = virtualMachinesTab.editVmWizard;
      for (const { name, network, pvc, volume } of [
        { name: VM1_NAME, network: undefined, pvc: VM1_PVC_TEMPLATE, volume: VM1_VOLUME_TEMPLATE },
        { name: VM2_NAME, network: VM2_NETWORK_TEMPLATE, pvc: VM2_PVC_TEMPLATE, volume: undefined },
      ]) {
        await virtualMachinesTab.openEditVmWizard(name);
        await wizard.advanceToNamingTemplatesStep();
        await verifyVmNameTemplateSelection(wizard.namingTemplatesStep, 'pvcNameTemplate', pvc);
        await verifyVmNameTemplateSelection(
          wizard.namingTemplatesStep,
          'volumeNameTemplate',
          volume,
        );
        await verifyVmNameTemplateSelection(
          wizard.namingTemplatesStep,
          'networkNameTemplate',
          network,
        );
        await wizard.cancelButton.click();
        await expect(wizard.root).not.toBeVisible();
      }
    });
  });
});

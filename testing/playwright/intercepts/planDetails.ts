import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupPlanDetailsIntercepts = async (page: Page) => {
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans/${TEST_DATA.planName}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            metadata: {
              annotations: {
                populatorLabels: 'True',
              },
              creationTimestamp: new Date().toISOString(),
              generation: 1,
              managedFields: [
                {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  fieldsType: 'FieldsV1',
                  fieldsV1: {
                    'f:spec': {
                      '.': {},
                      'f:map': {
                        '.': {},
                        'f:network': {},
                        'f:storage': {},
                      },
                      'f:migrateSharedDisks': {},
                      'f:provider': {
                        '.': {},
                        'f:destination': {},
                        'f:source': {},
                      },
                      'f:pvcNameTemplateUseGenerateName': {},
                      'f:skipGuestConversion': {},
                      'f:targetNamespace': {},
                      'f:vms': {},
                      'f:warm': {},
                    },
                  },
                  manager: 'Mozilla',
                  operation: 'Update',
                  time: new Date().toISOString(),
                },
              ],
              name: TEST_DATA.planName,
              namespace: MTV_NAMESPACE,
              resourceVersion: '5204230',
              uid: 'test-plan-uid-1',
            },
            spec: {
              map: {
                network: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'NetworkMap',
                  name: `${TEST_DATA.planName}-networkmap`,
                  namespace: MTV_NAMESPACE,
                  uid: 'test-networkmap-uid-1',
                },
                storage: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'StorageMap',
                  name: `${TEST_DATA.planName}-storagemap`,
                  namespace: MTV_NAMESPACE,
                  uid: 'test-storagemap-uid-1',
                },
              },
              migrateSharedDisks: false,
              provider: {
                destination: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'Provider',
                  name: TEST_DATA.providers.target.name,
                  namespace: MTV_NAMESPACE,
                  uid: TEST_DATA.providers.target.uid,
                },
                source: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'Provider',
                  name: TEST_DATA.providers.source.name,
                  namespace: MTV_NAMESPACE,
                  uid: TEST_DATA.providers.source.uid,
                },
              },
              pvcNameTemplateUseGenerateName: true,
              skipGuestConversion: false,
              targetNamespace: TEST_DATA.targetProject,
              description: 'Test plan for automated testing',
              vms: [
                {
                  id: 'test-vm-1',
                  name: 'test-virtual-machine-1',
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
          }),
        });
      } else {
        await route.continue();
      }
    },
  );
};

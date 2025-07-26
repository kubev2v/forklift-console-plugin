import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupPlanDetailsIntercepts = async (page: Page) => {
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans/${TEST_DATA.planName}`,
    async (route) => {
      // eslint-disable-next-line no-console
      console.log(
        `🎯 PLAN DETAILS INTERCEPT TRIGGERED - ${route.request().method()} ${route.request().url()}`,
      );

      if (route.request().method() === 'GET') {
        // eslint-disable-next-line no-console
        console.log(`✅ SERVING PLAN DETAILS FOR: ${TEST_DATA.planName}`);

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
              namespace: 'openshift-mtv',
              resourceVersion: '5204230',
              uid: 'test-plan-uid-1',
            },
            spec: {
              map: {
                network: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'NetworkMap',
                  name: `${TEST_DATA.planName}-networkmap`,
                  namespace: 'openshift-mtv',
                  uid: 'test-networkmap-uid-1',
                },
                storage: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'StorageMap',
                  name: `${TEST_DATA.planName}-storagemap`,
                  namespace: 'openshift-mtv',
                  uid: 'test-storagemap-uid-1',
                },
              },
              migrateSharedDisks: false,
              provider: {
                destination: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'Provider',
                  name: TEST_DATA.providers.target.name,
                  namespace: 'openshift-mtv',
                  uid: TEST_DATA.providers.target.uid,
                },
                source: {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'Provider',
                  name: TEST_DATA.providers.source.name,
                  namespace: 'openshift-mtv',
                  uid: TEST_DATA.providers.source.uid,
                },
              },
              pvcNameTemplateUseGenerateName: true,
              skipGuestConversion: false,
              targetNamespace: TEST_DATA.targetProject,
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

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { StorageMapCreatePage } from '../../../page-objects/StorageMapCreatePage';
import { StorageMapsListPage } from '../../../page-objects/StorageMapsListPage';
import { createSecret } from '../../../utils/resource-manager/ResourceCreator';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe(
  'Storage Offloading - Secret Filtering',
  { tag: '@downstream' },
  () => {
    // MTV-6121 Opaque-only filter is main/5.0; absent on 2.12.z.
    requireVersion(test, V5_0_0);

    test('should only show Opaque secrets in the storage secret dropdown', async ({
      page,
      resourceManager,
      testProvider,
    }) => {
      if (!testProvider) {
        throw new Error('testProvider is required');
      }

      const listPage = new StorageMapsListPage(page);
      const createPage = new StorageMapCreatePage(page);

      // 1. Create an Opaque secret
      const opaqueSecretName = `opaque-secret-${Math.random().toString(36).substring(7)}`;
      await createSecret({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: opaqueSecretName, namespace: MTV_NAMESPACE },
        stringData: { key: 'value' },
        type: 'Opaque',
      }, MTV_NAMESPACE);
      resourceManager.addSecret(opaqueSecretName, MTV_NAMESPACE);

      // 2. Create a non-Opaque secret
      const tlsSecretName = `tls-secret-${Math.random().toString(36).substring(7)}`;
      await createSecret({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: tlsSecretName, namespace: MTV_NAMESPACE },
        stringData: { 'tls.crt': '...', 'tls.key': '...' },
        type: 'kubernetes.io/tls',
      }, MTV_NAMESPACE);
      resourceManager.addSecret(tlsSecretName, MTV_NAMESPACE);

      await test.step('Navigate to Create Storage Map form', async () => {
        await listPage.navigate(MTV_NAMESPACE);
        await listPage.clickCreateWithFormButton();
        await createPage.waitForPageLoad();
      });

      await test.step('Fill form: name, project, providers', async () => {
        await createPage.fillMapName(`filter-test-sm-${Math.random().toString(36).substring(7)}`);
        await createPage.selectProject(MTV_NAMESPACE);
        await createPage.selectSourceProvider(testProvider.metadata.name);
        await createPage.selectTargetProvider('host');
        await createPage.waitForMappingTableReady();
      });

      await test.step('Expand offload options', async () => {
        await createPage.offload.verifyOffloadToggleVisible(0);
        await createPage.offload.expandOffloadOptions(0);
        await createPage.offload.verifyAllDropdownsVisible(0);
      });

      await test.step('Verify storage secret dropdown contains only the Opaque secret', async () => {
        await createPage.offload.verifyStorageSecretOptions(0, [opaqueSecretName], [tlsSecretName]);
      });
    });
  },
);

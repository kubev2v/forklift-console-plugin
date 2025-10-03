import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../fixtures/resourceFixtures';
import { NetworkMapCreatePage } from '../../page-objects/NetworkMapCreatePage';
import { NetworkMapDetailsPage } from '../../page-objects/NetworkMapDetailsPage';
import { NetworkMapsListPage } from '../../page-objects/NetworkMapsListPage';

test.describe('Network Maps', { tag: '@downstream' }, () => {
  test('should create network map via form and YAML', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const networkMapsListPage = new NetworkMapsListPage(page);
    const networkMapCreatePage = new NetworkMapCreatePage(page);
    const networkMapDetailsPage = new NetworkMapDetailsPage(page);

    await networkMapsListPage.navigate();
    await networkMapsListPage.clickCreateWithFormButton();
    const mapName = `test-network-map${crypto.randomUUID().substring(0, 5)}`;
    await networkMapCreatePage.fillRequiredFields({
      mapName,
      project: 'openshift-mtv',
      sourceProvider: testProvider.metadata!.name!,
      targetProvider: 'host',
      sourceNetwork: 'VM Network',
      targetNetwork: 'Default network',
    });
    await expect(networkMapCreatePage.createButton).toBeEnabled();

    //add mapping
    await networkMapCreatePage.addMapping();
    await expect(networkMapCreatePage.createButton).toBeDisabled();
    await networkMapCreatePage.populateMapping(1, 'Mgmt Network', 'Default network');

    //remove mappings
    await networkMapCreatePage.removeMapping(1);
    await expect(networkMapCreatePage.createButton).toBeEnabled();
    await networkMapCreatePage.removeMapping(0);
    await expect(networkMapCreatePage.createButton).toBeDisabled();

    // readd mappings
    await networkMapCreatePage.addMapping();
    await expect(networkMapCreatePage.createButton).toBeDisabled();
    await networkMapCreatePage.populateMapping(0, 'VM Network', 'Default network');
    await networkMapCreatePage.addMapping();
    await networkMapCreatePage.populateMapping(1, 'Mgmt Network', 'Default network');

    //submit form
    await networkMapCreatePage.submitForm(mapName);

    // Add network map to cleanup
    resourceManager.addNetworkMap(mapName, 'openshift-mtv');

    //verifyNetworkMapDetailsPage
    await networkMapDetailsPage.verifyNetworkMapDetailsPage({
      networkMapName: mapName,
      sourceProvider: testProvider.metadata!.name!,
      targetProvider: 'host',
      mappings: [
        { sourceNetwork: 'VM Network', targetNetwork: 'Default network' },
        { sourceNetwork: 'Mgmt Network', targetNetwork: 'Default network' },
      ],
    });

    // Navigate to YAML tab and copy YAML
    await networkMapDetailsPage.navigateToYamlTab();
    const yamlContent = await networkMapDetailsPage.yaml.copyYamlToClipboard();

    // Create a new network map from the copied YAML with a different name
    const newMapName = `${mapName}-copy`;

    // Navigate to NetworkMaps list page and click create with YAML
    await networkMapsListPage.navigate();
    await networkMapsListPage.clickCreateWithYamlButton();

    // Fill the YAML editor with updated content (replace name)
    const updatedYaml = yamlContent.replace(`name: ${mapName}`, `name: ${newMapName}`);
    await networkMapDetailsPage.yaml.fillYamlContent(updatedYaml);
    await networkMapDetailsPage.yaml.submitYamlForm(newMapName, 'NetworkMap');

    // Add the new network map to resource manager for cleanup
    resourceManager.addNetworkMap(newMapName, 'openshift-mtv');

    //verifyNetworkMapDetailsPage
    await networkMapDetailsPage.verifyNetworkMapDetailsPage({
      networkMapName: newMapName,
      sourceProvider: testProvider.metadata!.name!,
      targetProvider: 'host',
      mappings: [
        { sourceNetwork: 'VM Network', targetNetwork: 'Default network' },
        { sourceNetwork: 'Mgmt Network', targetNetwork: 'Default network' },
      ],
    });
  });
});

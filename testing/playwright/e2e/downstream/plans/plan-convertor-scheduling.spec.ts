import { setupPlanDetailsPage } from '../../../fixtures/helpers/planDetailsHelpers';
import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Details - Convertor Pod Labels', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);
  test('should edit convertor pod labels', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToConvertorSection();

    await test.step('Verify initial state has no labels', async () => {
      await planDetailsPage.settingsTab.verifyConvertorLabelsCount(0);
    });

    await test.step('Add a label and verify', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorLabels();
      await planDetailsPage.settingsTab.labelsModal.addLabel('workload', 'convertor');
      await planDetailsPage.settingsTab.labelsModal.save();

      await planDetailsPage.settingsTab.verifyConvertorLabelsCount(1);
      await planDetailsPage.settingsTab.verifyConvertorLabelsText('workload');
    });

    await test.step('Add a second label and verify both', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorLabels();
      await planDetailsPage.settingsTab.labelsModal.verifyLabelExists('workload', 'convertor');
      await planDetailsPage.settingsTab.labelsModal.addLabel('zone', 'us-east');
      await planDetailsPage.settingsTab.labelsModal.save();

      await planDetailsPage.settingsTab.verifyConvertorLabelsCount(2);
      await planDetailsPage.settingsTab.verifyConvertorLabelsText('workload');
      await planDetailsPage.settingsTab.verifyConvertorLabelsText('zone');
    });

    await test.step('Remove a label and verify only one remains', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorLabels();
      await planDetailsPage.settingsTab.labelsModal.deleteLabelByKey('zone');
      await planDetailsPage.settingsTab.labelsModal.save();

      await planDetailsPage.settingsTab.verifyConvertorLabelsCount(1);
      await planDetailsPage.settingsTab.verifyConvertorLabelsText('workload');
    });
  });
});

test.describe('Plan Details - Convertor Pod Node Selector', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should edit convertor pod node selector', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToConvertorSection();

    await test.step('Verify initial state has no node selectors', async () => {
      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorCount(0);
    });

    await test.step('Add a node selector and verify', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.settingsTab.nodeSelectorModal.addNodeSelector(
        'kubernetes.io/arch',
        'amd64',
      );
      await planDetailsPage.settingsTab.nodeSelectorModal.save();

      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorCount(1);
      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
    });

    await test.step('Add a second node selector and verify both', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.settingsTab.nodeSelectorModal.verifyNodeSelectorExists(
        'kubernetes.io/arch',
        'amd64',
      );
      await planDetailsPage.settingsTab.nodeSelectorModal.addNodeSelector(
        'node-role.kubernetes.io/worker',
        '',
      );
      await planDetailsPage.settingsTab.nodeSelectorModal.save();

      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorCount(2);
      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorText(
        'node-role.kubernetes.io/worker',
      );
    });

    await test.step('Remove a node selector and verify only one remains', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.settingsTab.nodeSelectorModal.deleteNodeSelectorByKey(
        'node-role.kubernetes.io/worker',
      );
      await planDetailsPage.settingsTab.nodeSelectorModal.save();

      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorCount(1);
      await planDetailsPage.settingsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
    });
  });
});

test.describe('Plan Details - Convertor Pod Affinity Rules', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should edit convertor pod affinity rules', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.settingsTab.navigateToConvertorSection();

    await test.step('Verify initial state has no affinity rules', async () => {
      await planDetailsPage.settingsTab.verifyConvertorAffinityRulesCount(0);
    });

    await test.step('Add a node affinity rule with required scheduling', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorAffinity();
      await planDetailsPage.settingsTab.affinityModal.clickAddAffinityRule();

      await planDetailsPage.settingsTab.affinityModal.verifyAffinityTypeOptions([
        'Node affinity',
        'Workload (pod) affinity',
        'Workload (pod) anti-affinity',
      ]);

      await planDetailsPage.settingsTab.affinityModal.selectAffinityType('Node affinity');

      await planDetailsPage.settingsTab.affinityModal.verifyConditionOptions([
        'Required during scheduling',
        'Preferred during scheduling',
      ]);

      await planDetailsPage.settingsTab.affinityModal.selectRuleType('Required during scheduling');
      await planDetailsPage.settingsTab.affinityModal.addExpression();
      await planDetailsPage.settingsTab.affinityModal.fillExpressionKey('kubernetes.io/hostname');
      await planDetailsPage.settingsTab.affinityModal.fillExpressionValue('worker-node-1');

      await planDetailsPage.settingsTab.affinityModal.saveAffinityRule();
      await planDetailsPage.settingsTab.affinityModal.verifyAffinityRuleExists();
      await planDetailsPage.settingsTab.affinityModal.save();

      await planDetailsPage.settingsTab.verifyConvertorAffinityRulesCount(1);
    });

    await test.step('Add a workload affinity rule with preferred scheduling', async () => {
      await planDetailsPage.settingsTab.clickEditConvertorAffinity();
      await planDetailsPage.settingsTab.affinityModal.clickAddAffinityRule();
      await planDetailsPage.settingsTab.affinityModal.selectAffinityType('Workload (pod) affinity');
      await planDetailsPage.settingsTab.affinityModal.selectRuleType('Preferred during scheduling');

      await planDetailsPage.settingsTab.affinityModal.fillWeight('50');
      await planDetailsPage.settingsTab.affinityModal.fillTopologyKey('kubernetes.io/hostname');
      await planDetailsPage.settingsTab.affinityModal.addExpression();
      await planDetailsPage.settingsTab.affinityModal.fillExpressionKey('app');
      await planDetailsPage.settingsTab.affinityModal.fillExpressionValue('database');
      await planDetailsPage.settingsTab.affinityModal.saveAffinityRule();

      await planDetailsPage.settingsTab.affinityModal.save();
      await planDetailsPage.settingsTab.verifyConvertorAffinityRulesCount(2);
    });
  });
});

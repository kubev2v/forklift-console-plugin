import type { Page } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { PlanTestData } from '../../../types/test-data';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

type TestPlan = { metadata: { name: string; namespace: string }; testData: PlanTestData };

const setupPlanDetailsPage = async (page: Page, testPlan: TestPlan | undefined) => {
  if (!testPlan) throw new Error('testPlan is required');
  const planDetailsPage = new PlanDetailsPage(page);
  const { name: planName, namespace } = testPlan.metadata;
  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  return { planDetailsPage };
};

test.describe('Plan Details - Convertor Pod Labels', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);
  test('should edit convertor pod labels', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify initial state has no labels', async () => {
      await planDetailsPage.detailsTab.verifyConvertorLabelsCount(0);
    });

    await test.step('Add a label and verify', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorLabels();
      await planDetailsPage.detailsTab.labelsModal.addLabel('workload', 'convertor');
      await planDetailsPage.detailsTab.labelsModal.save();

      await planDetailsPage.detailsTab.verifyConvertorLabelsCount(1);
      await planDetailsPage.detailsTab.verifyConvertorLabelsText('workload');
    });

    await test.step('Add a second label and verify both', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorLabels();
      await planDetailsPage.detailsTab.labelsModal.verifyLabelExists('workload', 'convertor');
      await planDetailsPage.detailsTab.labelsModal.addLabel('zone', 'us-east');
      await planDetailsPage.detailsTab.labelsModal.save();

      await planDetailsPage.detailsTab.verifyConvertorLabelsCount(2);
      await planDetailsPage.detailsTab.verifyConvertorLabelsText('workload');
      await planDetailsPage.detailsTab.verifyConvertorLabelsText('zone');
    });

    await test.step('Remove a label and verify only one remains', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorLabels();
      await planDetailsPage.detailsTab.labelsModal.deleteLabelByKey('zone');
      await planDetailsPage.detailsTab.labelsModal.save();

      await planDetailsPage.detailsTab.verifyConvertorLabelsCount(1);
      await planDetailsPage.detailsTab.verifyConvertorLabelsText('workload');
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
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify initial state has no node selectors', async () => {
      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorCount(0);
    });

    await test.step('Add a node selector and verify', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.detailsTab.nodeSelectorModal.addNodeSelector(
        'kubernetes.io/arch',
        'amd64',
      );
      await planDetailsPage.detailsTab.nodeSelectorModal.save();

      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorCount(1);
      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
    });

    await test.step('Add a second node selector and verify both', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.detailsTab.nodeSelectorModal.verifyNodeSelectorExists(
        'kubernetes.io/arch',
        'amd64',
      );
      await planDetailsPage.detailsTab.nodeSelectorModal.addNodeSelector(
        'node-role.kubernetes.io/worker',
        '',
      );
      await planDetailsPage.detailsTab.nodeSelectorModal.save();

      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorCount(2);
      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorText(
        'node-role.kubernetes.io/worker',
      );
    });

    await test.step('Remove a node selector and verify only one remains', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorNodeSelector();
      await planDetailsPage.detailsTab.nodeSelectorModal.deleteNodeSelectorByKey(
        'node-role.kubernetes.io/worker',
      );
      await planDetailsPage.detailsTab.nodeSelectorModal.save();

      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorCount(1);
      await planDetailsPage.detailsTab.verifyConvertorNodeSelectorText('kubernetes.io/arch');
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
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify initial state has no affinity rules', async () => {
      await planDetailsPage.detailsTab.verifyConvertorAffinityRulesCount(0);
    });

    await test.step('Add a node affinity rule with required scheduling', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorAffinity();
      await planDetailsPage.detailsTab.affinityModal.clickAddAffinityRule();

      await planDetailsPage.detailsTab.affinityModal.verifyAffinityTypeOptions([
        'Node affinity',
        'Workload (pod) affinity',
        'Workload (pod) anti-affinity',
      ]);

      await planDetailsPage.detailsTab.affinityModal.selectAffinityType('Node affinity');

      await planDetailsPage.detailsTab.affinityModal.verifyConditionOptions([
        'Required during scheduling',
        'Preferred during scheduling',
      ]);

      await planDetailsPage.detailsTab.affinityModal.selectRuleType('Required during scheduling');
      await planDetailsPage.detailsTab.affinityModal.addExpression();
      await planDetailsPage.detailsTab.affinityModal.fillExpressionKey('kubernetes.io/hostname');
      await planDetailsPage.detailsTab.affinityModal.fillExpressionValue('worker-node-1');

      await planDetailsPage.detailsTab.affinityModal.saveAffinityRule();
      await planDetailsPage.detailsTab.affinityModal.verifyAffinityRuleExists();
      await planDetailsPage.detailsTab.affinityModal.save();

      await planDetailsPage.detailsTab.verifyConvertorAffinityRulesCount(1);
    });

    await test.step('Add a workload affinity rule with preferred scheduling', async () => {
      await planDetailsPage.detailsTab.clickEditConvertorAffinity();
      await planDetailsPage.detailsTab.affinityModal.clickAddAffinityRule();
      await planDetailsPage.detailsTab.affinityModal.selectAffinityType('Workload (pod) affinity');
      await planDetailsPage.detailsTab.affinityModal.selectRuleType('Preferred during scheduling');

      await planDetailsPage.detailsTab.affinityModal.fillWeight('50');
      await planDetailsPage.detailsTab.affinityModal.fillTopologyKey('kubernetes.io/hostname');
      await planDetailsPage.detailsTab.affinityModal.addExpression();
      await planDetailsPage.detailsTab.affinityModal.fillExpressionKey('app');
      await planDetailsPage.detailsTab.affinityModal.fillExpressionValue('database');
      await planDetailsPage.detailsTab.affinityModal.saveAffinityRule();

      await planDetailsPage.detailsTab.affinityModal.save();
      await planDetailsPage.detailsTab.verifyConvertorAffinityRulesCount(2);
    });
  });
});

import type { V1beta1Plan } from '@forklift-ui/types';
import { expect, type Page } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import type { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_11_3 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

/**
 * MTV-4995 regression: Plan UI showed "Cannot start" while Plan YAML showed Ready.
 * Root cause: stale cached read in Plan reconciliation (fix: kubev2v/forklift@d376131).
 */

type Condition = { category?: string; message?: string; status?: string; type?: string };

const CONDITION_TRUE = 'True';
const CRITICAL = 'Critical';
const READY = 'Ready';

const activeConditions = (conditions: Condition[]): Condition[] =>
  conditions.filter((cond) => cond.status === CONDITION_TRUE);

const hasCritical = (conditions: Condition[]): boolean =>
  activeConditions(conditions).some((cond) => cond.category === CRITICAL);

const hasReady = (conditions: Condition[]): boolean =>
  activeConditions(conditions).some((cond) => cond.type === READY);

const findStaleMapCondition = (conditions: Condition[], mapKind: string): Condition | undefined =>
  activeConditions(conditions).find(
    (cond) =>
      cond.category === CRITICAL &&
      cond.message?.toLowerCase().includes(mapKind) &&
      cond.message?.toLowerCase().includes('ready'),
  );

type MapVerifyOptions = {
  fallbackNamespace: string;
  mapKind: 'network' | 'storage';
  page: Page;
  planConditions: Condition[];
  ref: { name?: string; namespace?: string } | undefined;
  resourceManager: ResourceManager;
};

const verifyMapNotStale = async (opts: MapVerifyOptions): Promise<void> => {
  const { fallbackNamespace, mapKind, page, planConditions, ref, resourceManager } = opts;
  if (!ref?.name) return;

  const fetchMethod = mapKind === 'network' ? 'fetchNetworkMap' : 'fetchStorageMap';
  const mapResource = await resourceManager[fetchMethod](
    page,
    ref.name,
    ref.namespace ?? fallbackNamespace,
  );
  expect(mapResource).not.toBeNull();

  const mapConditions = (mapResource?.status?.conditions ?? []) as Condition[];
  const mapReady = hasReady(mapConditions);

  expect
    .soft(mapReady, `${mapKind}Map "${ref.name}" is not Ready — would legitimately block the plan`)
    .toBe(true);

  if (mapReady) {
    const stale = findStaleMapCondition(planConditions, mapKind);
    expect
      .soft(stale, `${mapKind}Map is Ready but Plan has stale condition: "${stale?.message}"`)
      .toBeUndefined();
  }
};

test.describe(
  'Plan Status Consistency — UI matches YAML (MTV-4995 regression)',
  { tag: '@downstream' },
  () => {
    requireVersion(test, V2_11_3);

    test('should show consistent status between UI and Plan CR after wizard creation', async ({
      page,
      testPlan,
      testProvider: _testProvider,
      resourceManager,
    }) => {
      test.setTimeout(120_000);

      if (!testPlan) throw new Error('testPlan fixture is required');

      const { name: planName, namespace: planNamespace } = testPlan.metadata;
      const planDetailsPage = new PlanDetailsPage(page);

      await test.step('Navigate to plan details', async () => {
        await planDetailsPage.navigate(planName, planNamespace);
        await planDetailsPage.detailsTab.navigateToDetailsTab();
      });

      const uiStatus = await test.step('Read UI status', async () => {
        const { status } = await planDetailsPage.getMigrationStatus();
        return status;
      });

      const plan = await test.step('Fetch Plan CR via API', async () => {
        const fetched = await resourceManager.fetchPlan(page, planName, planNamespace);
        expect(fetched).not.toBeNull();
        return fetched as V1beta1Plan;
      });

      const planConditions = (plan.status?.conditions ?? []) as Condition[];

      await test.step('Verify Ready + Critical never coexist on Plan', () => {
        if (hasReady(planConditions) && hasCritical(planConditions)) {
          const messages = activeConditions(planConditions)
            .filter((cond) => cond.category === CRITICAL)
            .map((cond) => `${cond.type}: ${cond.message}`);

          expect
            .soft(false, `Ready + Critical coexist (MTV-4995 signature): [${messages.join('; ')}]`)
            .toBe(true);
        }
      });

      await test.step('Verify UI status matches YAML conditions', () => {
        const uiLower = uiStatus.toLowerCase();
        const isCritical = hasCritical(planConditions);
        const isReady = hasReady(planConditions);

        if (isReady && !isCritical) {
          expect.soft(uiLower, `YAML is Ready but UI shows "${uiStatus}"`).toContain('ready');
        }
        if (isCritical) {
          expect
            .soft(uiLower, `YAML has Critical but UI shows "${uiStatus}"`)
            .toContain('cannot start');
        }
      });

      await test.step('Verify maps are Ready with no stale plan conditions', async () => {
        const common = { fallbackNamespace: planNamespace, page, planConditions, resourceManager };
        await verifyMapNotStale({ ...common, mapKind: 'network', ref: plan.spec?.map?.network });
        await verifyMapNotStale({ ...common, mapKind: 'storage', ref: plan.spec?.map?.storage });
      });
    });

    test('should clear stale conditions after patching a temporarily broken NetworkMap', async ({
      page,
      testPlan,
      testProvider: _testProvider,
      resourceManager,
    }) => {
      test.setTimeout(120_000);

      if (!testPlan) throw new Error('testPlan fixture is required');

      const { name: planName, namespace: planNamespace } = testPlan.metadata;
      const planDetailsPage = new PlanDetailsPage(page);

      const plan = await test.step('Fetch Plan CR', async () => {
        const fetched = await resourceManager.fetchPlan(page, planName, planNamespace);
        expect(fetched).not.toBeNull();
        return fetched as V1beta1Plan;
      });

      const networkMapRef = plan.spec?.map?.network;
      if (!networkMapRef?.name) {
        test.skip(true, 'Plan has no referenced NetworkMap');
        return;
      }

      const nmNamespace = networkMapRef.namespace ?? planNamespace;

      await test.step('Break NetworkMap by pointing to non-existent provider', async () => {
        const patched = await resourceManager.patchResource(page, {
          kind: 'NetworkMap',
          resourceName: networkMapRef.name!,
          namespace: nmNamespace,
          patch: {
            spec: {
              provider: { source: { name: 'non-existent-provider', namespace: MTV_NAMESPACE } },
            },
          },
        });
        expect(patched).not.toBeNull();
      });

      await test.step('Wait for Plan to show Cannot start', async () => {
        await planDetailsPage.navigate(planName, planNamespace);
        await planDetailsPage.waitForPlanStatus('Cannot start');
      });

      await test.step('Restore NetworkMap to original provider', async () => {
        const source = plan.spec?.provider?.source;
        const patched = await resourceManager.patchResource(page, {
          kind: 'NetworkMap',
          resourceName: networkMapRef.name!,
          namespace: nmNamespace,
          patch: {
            spec: { provider: { source: { name: source?.name, namespace: source?.namespace } } },
          },
        });
        expect(patched).not.toBeNull();
      });

      await test.step('Verify Plan recovers to Ready (MTV-4995 core assertion)', async () => {
        await page.reload();
        await planDetailsPage.waitForPlanStatus('Ready for migration');

        const refreshed = await resourceManager.fetchPlan(page, planName, planNamespace);
        expect(refreshed).not.toBeNull();

        const conditions = ((refreshed as V1beta1Plan).status?.conditions ?? []) as Condition[];
        expect(hasReady(conditions)).toBe(true);
        expect(hasCritical(conditions)).toBe(false);
      });
    });
  },
);

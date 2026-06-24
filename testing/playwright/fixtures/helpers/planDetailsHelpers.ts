import type { Page } from '@playwright/test';

import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { PlanTestData } from '../../types/test-data';

type TestPlan = { metadata: { name: string; namespace: string }; testData: PlanTestData };

type PlanDetailsSetup = {
  namespace: string;
  planDetailsPage: PlanDetailsPage;
  planName: string;
  testData: PlanTestData;
};

/** Navigates to a plan details page and verifies the title. Throws if testPlan is missing. */
export const setupPlanDetailsPage = async (
  page: Page,
  testPlan: TestPlan | undefined,
): Promise<PlanDetailsSetup> => {
  if (!testPlan) throw new Error('testPlan is required');
  const planDetailsPage = new PlanDetailsPage(page);
  const { name: planName, namespace } = testPlan.metadata;
  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  return { namespace, planDetailsPage, planName, testData: testPlan.testData };
};

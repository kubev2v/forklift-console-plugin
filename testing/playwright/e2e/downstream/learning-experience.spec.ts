import { expect, test } from '@playwright/test';

import {
  MTV_PAGES,
  PROVIDER_TYPES,
  QUICK_REFERENCE,
  TIPS_AND_TRICKS_TOPICS,
} from '../../fixtures/overview-page-topics';
import { LearningExperienceDrawer } from '../../page-objects/LearningExperienceDrawer';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { requireVersion, V2_11_0 } from '../../utils/version';

const [CREATING_PROVIDER_TOPIC] = TIPS_AND_TRICKS_TOPICS;
const VMWARE_STEP_COUNT = 5;

test.describe(
  'Learning Experience - General',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V2_11_0);

    test('should verify Tips and tricks drawer structure and all topics', async ({ page }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;

      await test.step('Navigate to MTV Overview page', async () => {
        await overviewPage.navigateDirectly();
      });

      await test.step('Open drawer and verify all topics present', async () => {
        await learningExperience.openAndVerify();
        await learningExperience.verifyTopicCards(TIPS_AND_TRICKS_TOPICS);
        await learningExperience.verifyPicklist(TIPS_AND_TRICKS_TOPICS);
      });

      await test.step('Verify all topics have expandable sections', async () => {
        for (let i = 0; i < TIPS_AND_TRICKS_TOPICS.length; i += 1) {
          const topic = TIPS_AND_TRICKS_TOPICS[i];

          if (i === 0) {
            await learningExperience.selectTopicByCard(topic);
          } else {
            await learningExperience.navigateToTopic(topic.name);
            await learningExperience.verifyTopicHeading(topic.name);
          }

          if (topic.minimumAccordions) {
            await learningExperience.testAccordionsStructure(topic.minimumAccordions);
          }
        }
      });

      await test.step('Verify External links section', async () => {
        await learningExperience.verifyExternalLinks();
      });

      await test.step('Close drawer', async () => {
        await learningExperience.close();
      });
    });
  },
);

test.describe(
  'Learning Experience - Drawer Features',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V2_11_0);

    test('should verify provider type selector switches between all provider types', async ({
      page,
    }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;

      await overviewPage.navigateDirectly();
      await learningExperience.open();

      await test.step('Select Creating a provider topic', async () => {
        await learningExperience.selectTopicByCard(CREATING_PROVIDER_TOPIC);
      });

      await test.step(`Verify ${PROVIDER_TYPES.VMWARE} is default with ${VMWARE_STEP_COUNT} steps`, async () => {
        await learningExperience.verifyProviderTypeDropdownVisible(PROVIDER_TYPES.VMWARE);
        await learningExperience.verifyStepVisible(VMWARE_STEP_COUNT);
      });

      await test.step('Verify all 5 provider types are available', async () => {
        await learningExperience.getProviderTypeDropdown(PROVIDER_TYPES.VMWARE).click();
        await learningExperience.verifyAllProviderTypesInDropdown();
      });

      await test.step(`Select ${PROVIDER_TYPES.OPENSTACK} and verify specific content`, async () => {
        await learningExperience.getProviderTypeMenuItem(PROVIDER_TYPES.OPENSTACK).click();
        await expect(learningExperience.openStackAuthTypeText).toBeVisible();
      });

      await test.step(`Select ${PROVIDER_TYPES.RHV}`, async () => {
        await learningExperience.selectProviderType(PROVIDER_TYPES.OPENSTACK, PROVIDER_TYPES.RHV);
        await learningExperience.verifyProviderTypeDropdownVisible(PROVIDER_TYPES.RHV);
      });

      await test.step(`Select ${PROVIDER_TYPES.OVA}`, async () => {
        await learningExperience.selectProviderType(PROVIDER_TYPES.RHV, PROVIDER_TYPES.OVA);
        await learningExperience.verifyProviderTypeDropdownVisible(PROVIDER_TYPES.OVA);
      });
    });

    test('should verify Quick Reference section with Key terminology and Key considerations', async ({
      page,
    }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;

      await overviewPage.navigateDirectly();
      await learningExperience.open();

      await test.step('Verify Quick reference heading is visible', async () => {
        await expect(learningExperience.getQuickReferenceHeading()).toBeVisible();
      });

      await test.step('Verify Key terminology expands and collapses', async () => {
        const keyTerminologyButton = learningExperience.getKeyTerminologyButton();
        await expect(keyTerminologyButton).toBeVisible();

        await keyTerminologyButton.click();
        await learningExperience.verifyKeyTerminologyItems(QUICK_REFERENCE.KEY_TERMINOLOGY);

        await keyTerminologyButton.click();
        await learningExperience.verifyKeyTerminologyCollapsed();
      });

      await test.step('Verify Key considerations expands and collapses', async () => {
        const keyConsiderationsButton = learningExperience.getKeyConsiderationsButton();
        await expect(keyConsiderationsButton).toBeVisible();

        await keyConsiderationsButton.click();
        await learningExperience.verifyKeyConsiderationsItems(QUICK_REFERENCE.KEY_CONSIDERATIONS);

        await keyConsiderationsButton.click();
        await learningExperience.verifyKeyConsiderationsCollapsed();
      });
    });
  },
);

test.describe(
  'Learning Experience - All MTV Pages',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V2_11_0);

    test('should show Tips and tricks on all MTV pages', async ({ page }) => {
      const learningExperience = new LearningExperienceDrawer(page);

      for (const pageConfig of MTV_PAGES) {
        await test.step(`Verify Tips and tricks on ${pageConfig.name} page`, async () => {
          await learningExperience.navigateToResource(pageConfig.resource, pageConfig.heading);
          await learningExperience.open();
          await learningExperience.verifyTopicNamesVisible(TIPS_AND_TRICKS_TOPICS);
          await learningExperience.close();
        });
      }
    });
  },
);

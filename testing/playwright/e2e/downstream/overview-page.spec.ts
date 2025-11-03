import { expect, test } from '@playwright/test';

import { TIPS_AND_TRICKS_TOPICS } from '../../fixtures/overview-page-topics';
import { OverviewPage } from '../../page-objects/OverviewPage';

test.describe(
  'Overview Page - Tips and Tricks',
  {
    tag: '@downstream',
  },
  () => {
    test('should verify complete Tips and tricks functionality with all expandable content', async ({
      page,
    }) => {
      const overviewPage = new OverviewPage(page);

      // SETUP: Navigate to Overview page
      await overviewPage.navigateDirectly();

      // STEP 1: Navigate to Tips and Tricks and Verify All Topics Present
      const { drawerTitle, closeDrawerButton } = await overviewPage.openTipsAndTricksDrawer();
      await overviewPage.verifyTopicCards(TIPS_AND_TRICKS_TOPICS);
      await overviewPage.verifyPicklist(TIPS_AND_TRICKS_TOPICS);

      // STEP 2: Test All Topics and Expandable Sections
      for (let i = 0; i < TIPS_AND_TRICKS_TOPICS.length; i += 1) {
        const topic = TIPS_AND_TRICKS_TOPICS[i];

        // Select topic (first via card, remaining via dropdown)
        if (i === 0) {
          await overviewPage.selectTopicByCard(topic);
        } else {
          const previousTopic = TIPS_AND_TRICKS_TOPICS[i - 1];
          await overviewPage.navigateToNextTopic(previousTopic.name, topic.name);
          await overviewPage.verifyTopicHeading(topic.name);
        }

        // Test expandable sections structure
        if (topic.minimumAccordions) {
          await overviewPage.testAccordionsStructure(topic.minimumAccordions);
        }
      }

      // STEP 3: Verify Drawer Close Functionality
      await closeDrawerButton.click();
      await expect(drawerTitle).not.toBeVisible();
    });
  },
);

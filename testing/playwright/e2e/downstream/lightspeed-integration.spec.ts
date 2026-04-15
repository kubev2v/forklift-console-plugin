import { expect, test } from '@playwright/test';

import { TIPS_AND_TRICKS_TOPICS } from '../../fixtures/overview-page-topics';
import { AI_PROMPT_QUESTIONS } from '../../page-objects/LearningExperienceDrawer';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { requireLightspeed } from '../../utils/lightspeed/lightspeed';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const TROUBLESHOOTING_TOPIC = TIPS_AND_TRICKS_TOPICS.at(-1);

test.describe(
  'Lightspeed Integration - Ask AI Assistant',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V2_12_0);
    requireLightspeed(test);

    test('should show Ask AI section in the Troubleshooting topic', async ({ page }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;

      await test.step('Navigate to MTV Overview and open drawer', async () => {
        await overviewPage.navigateDirectly();
        await learningExperience.open();
      });

      await test.step('Navigate to Troubleshooting topic', async () => {
        await learningExperience.selectTopicByCard(TROUBLESHOOTING_TOPIC);
      });

      await test.step('Verify Ask AI assistant section is visible', async () => {
        await expect(learningExperience.askAIHeading).toBeVisible();
        await expect(learningExperience.commonQuestionsToggle).toBeVisible();
      });
    });

    test('should expand and show pre-canned troubleshooting questions', async ({ page }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;

      await test.step('Navigate to Troubleshooting topic', async () => {
        await overviewPage.navigateDirectly();
        await learningExperience.open();
        await learningExperience.selectTopicByCard(TROUBLESHOOTING_TOPIC);
      });

      await test.step('Expand Common troubleshooting questions', async () => {
        await learningExperience.commonQuestionsToggle.click();
      });

      await test.step('Verify all 3 pre-canned questions are visible', async () => {
        for (const question of AI_PROMPT_QUESTIONS) {
          await expect(learningExperience.getQuestionButton(question)).toBeVisible();
        }
      });

      await test.step('Collapse questions', async () => {
        await learningExperience.commonQuestionsToggle.click();
        await expect(
          learningExperience.getQuestionButton(AI_PROMPT_QUESTIONS[0]),
        ).not.toBeVisible();
      });
    });

    test('should open OLS panel with pre-filled prompt when clicking a question', async ({
      page,
    }) => {
      const overviewPage = new OverviewPage(page);
      const { learningExperience } = overviewPage;
      const [, testQuestion] = AI_PROMPT_QUESTIONS;

      await test.step('Navigate to Troubleshooting topic and expand questions', async () => {
        await overviewPage.navigateDirectly();
        await learningExperience.open();
        await learningExperience.selectTopicByCard(TROUBLESHOOTING_TOPIC);
        await learningExperience.commonQuestionsToggle.click();
      });

      await test.step('Click a pre-canned question', async () => {
        await learningExperience.getQuestionButton(testQuestion).click();
      });

      await test.step('Verify OLS panel opens with the question pre-filled', async () => {
        await expect(learningExperience.olsPanel).toBeVisible();
        await expect(learningExperience.olsInputField).toHaveValue(testQuestion);
      });
    });
  },
);

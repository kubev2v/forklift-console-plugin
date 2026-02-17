import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/utils/types';

import { WrenchIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import AskAISection from './components/AskAISection';
import { cliLogsSubTopic } from './subTopics/cliLogsSubTopic';
import { faqHelpSubTopic } from './subTopics/faqHelpSubTopic';
import { forkliftControllerLogsSubTopic } from './subTopics/forkliftControllerLogsSubTopic';
import { migrationProgressSubTopic } from './subTopics/migrationsProgressSubTopic';
import { podLogsSubTopic } from './subTopics/podLogsSubTopic';
import { supportSubTopic } from './subTopics/supportSubTopic';

const aiAssistantSubTopic = (): LearningExperienceSubTopic => ({
  className: 'm-no-border',
  id: 'troubleshooting-ai-assistant',
  title: <AskAISection />,
});

const troubleShootingSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'troubleshooting-where-to-start',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      migrationProgressSubTopic(),
      podLogsSubTopic(),
      forkliftControllerLogsSubTopic(),
      cliLogsSubTopic(),
      supportSubTopic(),
    ],
    title: t(
      'Stuck and not sure where to start? We recommend looking in this order for troubleshooting:',
    ),
  },
  aiAssistantSubTopic(),
  faqHelpSubTopic(),
];

export const troubleShootingTopic: LearningExperienceTopic = {
  description: t('Get quick answers to common problems.'),
  icon: WrenchIcon,
  id: 'troubleshooting',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: troubleShootingSubTopics,
  title: t('Troubleshooting'),
  trackingEventTopic: TipsTopic.Troubleshooting,
};

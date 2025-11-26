import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { WrenchIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import { cliLogsHelpTopic } from './cliLogsHelpTopic';
import { faqHelpTopic } from './faqHelpTopic';
import { forkliftControllerLogsHelpTopic } from './forkliftControllerLogsHelpTopic';
import { migrationProgressHelpTopic } from './migrationsProgressHelpTopic';
import { podLogsHelpTopic } from './podLogsHelpTopic';
import { supportHelpTopic } from './supportHelpTopic';

const troubleShootingHelpTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'troubleshooting-where-to-start',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      migrationProgressHelpTopic(),
      podLogsHelpTopic(),
      forkliftControllerLogsHelpTopic(),
      cliLogsHelpTopic(),
      supportHelpTopic(),
    ],
    title: t(
      'Stuck and not sure where to start? We recommend looking in this order for troubleshooting:',
    ),
  },
  faqHelpTopic(),
];

export const troubleShootingHelpTopic: LearningExperienceTopic = {
  description: t('Get quick answers to common problems.'),
  icon: <WrenchIcon />,
  id: 'troubleshooting',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: troubleShootingHelpTopics,
  title: t('Troubleshooting'),
  trackingEventTopic: TipsTopic.Troubleshooting,
};

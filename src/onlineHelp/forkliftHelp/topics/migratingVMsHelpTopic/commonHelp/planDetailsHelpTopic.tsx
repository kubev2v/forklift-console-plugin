import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent';
import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const planDetailsHelpTopic = (sourceProviderText: string): LearningExperienceSubTopic => ({
  id: 'migrating-plan-name',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'migrating-plan-name-a',
      title: (
        <HelpTitledContent
          title={t('Plan name:')}
          content={t(
            'Enter a unique and descriptive name for your migration plan (e.g., "VMware to OpenShift_Prod_AppX").',
          )}
        />
      ),
    },
    {
      id: 'migrating-plan-name-b',
      title: (
        <HelpTitledContent
          title={t('Plan project:')}
          content={t('Select the project (namespace) containing providers.')}
        />
      ),
    },
    {
      id: 'migrating-plan-name-c',
      title: <HelpTitledContent title={t('Source provider:')} content={sourceProviderText} />,
    },
    {
      id: 'migrating-plan-name-d',
      title: (
        <HelpTitledContent
          title={t('Target provider:')}
          content={t(`Choose the OpenShift Virtualization provider.`)}
        />
      ),
    },
    {
      id: 'migrating-plan-name-e',
      title: (
        <HelpTitledContent
          title={t('Target project:')}
          content={t(`Select the target project (namespace) for migrated VMs.`)}
        />
      ),
    },
  ],
  title: t('Define your plan details:'),
});

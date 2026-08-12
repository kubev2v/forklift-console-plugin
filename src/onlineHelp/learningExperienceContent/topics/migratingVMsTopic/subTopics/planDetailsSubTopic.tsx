import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const PLAN_DETAILS_SUB_TOPIC_ID = 'migrating-plan-name';

export const planDetailsSubTopic = (sourceProviderText: string): LearningExperienceSubTopic => ({
  id: PLAN_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          content={t(
            'Enter a unique and descriptive name for your migration plan (e.g., "VMware to OpenShift_Prod_AppX").',
          )}
          title={t('Plan name:')}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          content={t('Select the project (namespace) containing providers.')}
          title={t('Plan project:')}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-c`,
      title: <HelpTitledContent content={sourceProviderText} title={t('Source provider:')} />,
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-d`,
      title: (
        <HelpTitledContent
          content={t(`Choose the OpenShift Virtualization provider.`)}
          title={t('Target provider:')}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-e`,
      title: (
        <HelpTitledContent
          content={t(`Select the target project (namespace) for migrated VMs.`)}
          title={t('Target project:')}
        />
      ),
    },
  ],
  title: t('Define your plan details:'),
});

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
          title={t('Plan name:')}
          content={t(
            'Enter a unique and descriptive name for your migration plan (e.g., "VMware to OpenShift_Prod_AppX").',
          )}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Plan project:')}
          content={t('Select the project (namespace) containing providers.')}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-c`,
      title: <HelpTitledContent title={t('Source provider:')} content={sourceProviderText} />,
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-d`,
      title: (
        <HelpTitledContent
          title={t('Target provider:')}
          content={t(`Choose the OpenShift Virtualization provider.`)}
        />
      ),
    },
    {
      id: `${PLAN_DETAILS_SUB_TOPIC_ID}-e`,
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

import HelpTitledContent from 'src/onlineHelp/learningExperienceStructure/HelpTitledContent';
import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { ForkliftTrans, t } from '@utils/i18n';

import SelectedSourceMigrationLabel from '../../components/SelectedSourceMigrationLabel';

export const planDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-plan-name',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'migrating-plan-name-a',
      title: (
        <HelpTitledContent
          title={t('Plan name:')}
          content={
            <ForkliftTrans>
              Enter a unique and descriptive name for your migration plan (e.g., "
              <SelectedSourceMigrationLabel /> to OpenShift_Prod_AppX").'.
            </ForkliftTrans>
          }
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
      title: (
        <HelpTitledContent
          title={t('Source provider:')}
          content={
            <ForkliftTrans>
              Choose the{' '}
              <strong className="co-break-word">
                <SelectedSourceMigrationLabel />
              </strong>{' '}
              provider.
            </ForkliftTrans>
          }
        />
      ),
    },
    {
      id: 'migrating-plan-name-d',
      title: (
        <HelpTitledContent
          title={t('Target provider:')}
          content={
            <ForkliftTrans>
              Choose the <strong className="co-break-word">OpenShift Virtualization</strong>{' '}
              provider.
            </ForkliftTrans>
          }
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

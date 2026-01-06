import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { CubesIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import SourceMigrationSelection from '../components/SourceMigrationSelection';
import { LEARN_MORE_MIGRATING_VMS_DOCS_URL } from '../utils/constants';

import { commonMigratingVMsSubTopics } from './subTopics/commonMigratingVMsSubTopics';

const migratingVMsSubTopics = (): LearningExperienceSubTopic[] => {
  return [
    {
      id: 'vm-migration-type-select',
      title: (
        <div className="forklift--learning__help-description">
          {t(`Where are you migrating your VMs from?`)}
          <SourceMigrationSelection />
        </div>
      ),
    },
    ...commonMigratingVMsSubTopics(),
    {
      id: 'migration-learn-more-link',
      title: (
        <div className="forklift--learning__help-see-more-section">
          <ExternalLink href={LEARN_MORE_MIGRATING_VMS_DOCS_URL} isInline>
            {t('Learn more about migrating VMs')}
          </ExternalLink>
        </div>
      ),
    },
  ];
};

export const migratingVMsTopic = (): LearningExperienceTopic => ({
  description: t('Learn the best practices for seamlessly migrating your VMs.'),
  icon: <CubesIcon />,
  id: 'migrating-vms',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: migratingVMsSubTopics,
  title: t('Migrating your VMs'),
  trackingEventTopic: TipsTopic.MigratingVMs,
});

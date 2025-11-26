import { useContext } from 'react';
import { CreateForkliftContext } from 'src/forkliftWrapper/ForkliftContext';
import { MigrationSourceType } from 'src/onlineHelp/forkliftHelp/topics/types';
import SourceMigrationSelection from 'src/onlineHelp/forkliftHelp/topics/utils/SourceMigrationSelection';
import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { CubesIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import { commonMigrationHelpTopics } from './commonHelp/commonMigratingHelpTopics';
import { vmWareMigrationHelpTopics } from './vmWareMigrationHelp/vmWareMigrationHelpTopics';

const learnMoreUrl =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.0/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virtual-machines-to-virt_mtv';

const migratingYourVMsHelpSubTopics = (): LearningExperienceSubTopic[] => {
  const { learningExperienceContext } = useContext(CreateForkliftContext);
  const { data, setData } = learningExperienceContext;

  const helpTopics = () => {
    switch (learningExperienceContext.data.migrationSource) {
      case MigrationSourceType.VMWARE_VSPHERE:
        return vmWareMigrationHelpTopics();
      case MigrationSourceType.OPENSTACK:
        return commonMigrationHelpTopics(t('Choose your OpenStack provider.'));
      case MigrationSourceType.OPEN_VIRTUAL_APPLIANCE:
        return commonMigrationHelpTopics(t('Choose your Open Virtual Appliance provider.'));
      case MigrationSourceType.RED_HAT_VIRTUALIZATION:
        return commonMigrationHelpTopics(t('Choose your Red Hat Virtualization provider'));
      case MigrationSourceType.OPENSHIFT_VIRTUALIZATION:
        return commonMigrationHelpTopics(t('Choose your OpenShift Virtualization provider.'));
      default:
        return [];
    }
  };

  return [
    {
      id: 'vm-migration-type-select',
      title: (
        <div className="forklift--learning__help-description">
          {t(`Where are you migrating your VMs from?`)}
          <SourceMigrationSelection
            key={data.migrationSource}
            selectedSource={data.migrationSource}
            setSelectedSource={(selected: MigrationSourceType) => {
              setData('migrationSource', selected);
            }}
          />
        </div>
      ),
    },
    ...helpTopics(),
    {
      id: 'migration-learn-more-link',
      title: (
        <ExternalLink href={learnMoreUrl} isInline>
          {t('Learn more about migrating VMs')}
        </ExternalLink>
      ),
    },
  ];
};

export const migratingYourVmHelpTopic = (): LearningExperienceTopic => ({
  description: t('Learn the best practices for seamlessly migrating your VMs.'),
  icon: <CubesIcon />,
  id: 'migrating-vms',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: migratingYourVMsHelpSubTopics,
  title: t('Migrating your VMs'),
  trackingEventTopic: TipsTopic.MigratingVMs,
});

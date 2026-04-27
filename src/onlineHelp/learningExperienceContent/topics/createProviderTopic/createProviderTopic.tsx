import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/utils/types';
import { PROVIDER_TYPES, type ProviderTypes } from 'src/providers/utils/constants';

import { TelegramPlaneIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import SourceMigrationSelection from '../components/SourceMigrationSelection';

import { openshiftCreateProviderSubTopics } from './subTopics/openshiftCreateProviderSubTopics';
import { openstackCreateProviderSubTopics } from './subTopics/openstackCreateProviderSubTopics';
import { ovaCreateProviderSubTopics } from './subTopics/ovaCreateProviderSubTopics';
import { rhvCreateProviderSubTopics } from './subTopics/rhvCreateProviderSubTopics';
import { vmwareCreateProviderSubTopics } from './subTopics/vmwareCreateProviderSubTopics';

const createProviderSubTopics = (providerType?: ProviderTypes): LearningExperienceSubTopic[] => {
  const helpTopics = () => {
    switch (providerType) {
      case PROVIDER_TYPES.vsphere:
        return vmwareCreateProviderSubTopics();
      case PROVIDER_TYPES.openstack:
        return openstackCreateProviderSubTopics();
      case PROVIDER_TYPES.ova:
        return ovaCreateProviderSubTopics();
      case PROVIDER_TYPES.ovirt:
        return rhvCreateProviderSubTopics();
      case PROVIDER_TYPES.openshift:
        return openshiftCreateProviderSubTopics();
      case PROVIDER_TYPES.hyperv: // TODO: return hypervCreateProviderSubTopics();
      case undefined:
      default:
        return vmwareCreateProviderSubTopics();
    }
  };

  return [
    {
      id: 'create-provider-type-select',
      title: (
        <div className="forklift--learning__help-description">
          {t(`What type of provider do you want to create?`)}
          <SourceMigrationSelection />
        </div>
      ),
    },
    ...helpTopics(),
  ];
};

export const createProviderTopic: LearningExperienceTopic = {
  description: t('Step-by-step instructions for creating a provider.'),
  icon: TelegramPlaneIcon,
  id: 'creating-a-provider',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: createProviderSubTopics,
  title: t('Creating a provider'),
  trackingEventTopic: TipsTopic.CreateProvider,
};

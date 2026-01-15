import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { openstackAuthSubTopic } from './openstackAuthSubTopic';
import { openstackCertificateSubTopic } from './openstackCertificateSubTopic';
import { openstackProviderDetailsSubTopic } from './openstackProviderDetailsSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const openstackCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'openstack-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      openstackProviderDetailsSubTopic(),
      openstackAuthSubTopic(),
      openstackCertificateSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { openshiftCertificateSubTopic } from './openshiftCertificateSubTopic';
import { openshiftProviderDetailsSubTopic } from './openshiftProviderDetailsSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const openshiftCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'openshift-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      openshiftProviderDetailsSubTopic(),
      openshiftCertificateSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';
import { vmwareCredentialsSubTopic } from './vmwareCredentialsSubTopic';
import { vmwareProviderDetailsSubTopic } from './vmwareProviderDetailsSubTopic';

export const vmwareCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'vmware-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      vmwareProviderDetailsSubTopic(),
      vmwareCredentialsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

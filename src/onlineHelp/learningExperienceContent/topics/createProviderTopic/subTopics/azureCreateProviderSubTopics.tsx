import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { azureProviderDetailsSubTopic } from './azureProviderDetailsSubTopic';
import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const azureCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'azure-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      azureProviderDetailsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

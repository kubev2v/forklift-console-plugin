import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { nutanixProviderDetailsSubTopic } from './nutanixProviderDetailsSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const nutanixCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'nutanix-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      nutanixProviderDetailsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

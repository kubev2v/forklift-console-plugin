import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { hypervProviderDetailsSubTopic } from './hypervProviderDetailsSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const hypervCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'hyperv-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      hypervProviderDetailsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

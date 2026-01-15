import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { ovaProviderDetailsSubTopic } from './ovaProviderDetailsSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const ovaCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'ova-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      ovaProviderDetailsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

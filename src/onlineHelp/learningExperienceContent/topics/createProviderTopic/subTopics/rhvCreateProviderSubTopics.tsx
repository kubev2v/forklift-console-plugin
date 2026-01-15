import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';
import { rhvCredentialsSubTopic } from './rhvCredentialsSubTopic';
import { rhvProviderDetailsSubTopic } from './rhvProviderDetailsSubTopic';

export const rhvCreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'rhv-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      rhvProviderDetailsSubTopic(),
      rhvCredentialsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

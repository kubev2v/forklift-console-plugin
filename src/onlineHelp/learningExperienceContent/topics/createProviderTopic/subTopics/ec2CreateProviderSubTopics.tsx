import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { clickCreateProviderSubTopic } from './clickCreateProviderSubTopic';
import { ec2ProviderDetailsSubTopic } from './ec2ProviderDetailsSubTopic';
import { goToProvidersSubTopic } from './goToProvidersSubTopic';
import { reviewCreateProviderSubTopic } from './reviewCreateProviderSubTopic';

export const ec2CreateProviderSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'ec2-create-provider-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToProvidersSubTopic(),
      clickCreateProviderSubTopic(),
      ec2ProviderDetailsSubTopic(),
      reviewCreateProviderSubTopic(),
    ],
  },
];

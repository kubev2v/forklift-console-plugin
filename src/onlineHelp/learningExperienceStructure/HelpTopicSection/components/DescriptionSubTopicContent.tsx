import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import HelpSubTopic from '../../HelpSubTopic/HelpSubTopic';

type DescriptionSubTopicContentProps = {
  topic: LearningExperienceSubTopic;
};

const DescriptionSubTopicContent: FC<DescriptionSubTopicContentProps> = ({ topic }) => (
  <>
    {topic
      .subTopics?.()
      .map((subTopic) => <HelpSubTopic key={subTopic.id} topic={subTopic} noListItem />)}
  </>
);

export default DescriptionSubTopicContent;

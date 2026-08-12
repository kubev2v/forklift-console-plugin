import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import HelpTopicSection from '../../HelpTopicSection/HelpTopicSection';

type ExpandableSubTopicContentProps = {
  topic: LearningExperienceSubTopic;
};

const ExpandableSubTopicContent: FC<ExpandableSubTopicContentProps> = ({ topic }) => (
  <>
    {topic.subTopics?.().map((subTopic, subIndex) => (
      <HelpTopicSection index={subIndex} key={subTopic.id} topic={subTopic} />
    ))}
  </>
);

export default ExpandableSubTopicContent;

import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import ExpandableSubTopicContent from './ExpandableSubTopicContent';
import InlineSubTopicContent from './InlineSubTopicContent';

type NestedSubTopicsProps = {
  topic: LearningExperienceSubTopic;
};

const NestedSubTopics: FC<NestedSubTopicsProps> = ({ topic }) => {
  const SubTopicsComponent = topic.expandable ? ExpandableSubTopicContent : InlineSubTopicContent;

  return (
    <div className="pf-v6-u-ml-lg">
      <SubTopicsComponent topic={topic} />
    </div>
  );
};

export default NestedSubTopics;

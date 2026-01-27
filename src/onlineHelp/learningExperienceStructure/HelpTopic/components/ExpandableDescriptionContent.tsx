import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import HelpTopicSection from '../../HelpTopicSection/HelpTopicSection';

type ExpandableDescriptionContentProps = {
  subTopic: LearningExperienceSubTopic;
};

const ExpandableDescriptionContent: FC<ExpandableDescriptionContentProps> = ({ subTopic }) => {
  return (
    <>
      {subTopic.subTopics?.().map((nextSubTopic, subIndex) => (
        <HelpTopicSection
          key={nextSubTopic.id}
          topic={nextSubTopic}
          index={subIndex}
          listStyleType={subTopic.subListStyleType}
        />
      ))}
    </>
  );
};

export default ExpandableDescriptionContent;

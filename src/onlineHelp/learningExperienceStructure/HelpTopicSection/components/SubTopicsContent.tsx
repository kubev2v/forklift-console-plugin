import type { FC } from 'react';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { getClassForListStyle } from '../../../utils/utils';

import DescriptionSubTopicContent from './DescriptionSubTopicContent';
import ListSubTopicContent from './ListSubTopicContent';

type SubTopicsContentProps = {
  topic: LearningExperienceSubTopic;
};

const SubTopicsContent: FC<SubTopicsContentProps> = ({ topic }) => {
  const isDescriptionList = topic.subListStyleType === ListStyleType.DESCRIPTIONS;

  return (
    <div className="pf-v6-u-ml-lg pf-v6-u-mb-md">
      <div
        id={`${topic.id}: ${topic.subListStyleType}`}
        className={getClassForListStyle(topic.subListStyleType)}
      >
        {isDescriptionList ? (
          <DescriptionSubTopicContent topic={topic} />
        ) : (
          <ListSubTopicContent topic={topic} />
        )}
      </div>
    </div>
  );
};

export default SubTopicsContent;

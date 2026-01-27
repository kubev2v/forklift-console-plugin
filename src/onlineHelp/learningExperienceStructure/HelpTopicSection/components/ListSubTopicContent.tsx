import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { Content } from '@patternfly/react-core';

import { getTextListComponentForListStyle } from '../../../utils/utils';
import HelpSubTopic from '../../HelpSubTopic/HelpSubTopic';

type ListSubTopicContentProps = {
  topic: LearningExperienceSubTopic;
};

const ListSubTopicContent: FC<ListSubTopicContentProps> = ({ topic }) => (
  <Content component={getTextListComponentForListStyle(topic.subListStyleType)}>
    {topic.subTopics?.().map((subTopic) => (
      <HelpSubTopic key={subTopic.id} topic={subTopic} />
    ))}
  </Content>
);

export default ListSubTopicContent;

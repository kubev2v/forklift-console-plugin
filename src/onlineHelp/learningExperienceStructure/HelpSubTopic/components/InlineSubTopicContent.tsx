import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { getClassForListStyle, getTextListComponentForListStyle } from '../../../utils/utils';
import HelpSubTopic from '../HelpSubTopic';

type InlineSubTopicContentProps = {
  topic: LearningExperienceSubTopic;
};

const InlineSubTopicContent: FC<InlineSubTopicContentProps> = ({ topic }) => (
  <div className={css('pf-v6-u-mt-sm', getClassForListStyle(topic.subListStyleType))}>
    <Content component={getTextListComponentForListStyle(topic.subListStyleType)}>
      {topic.subTopics?.().map((subTopic) => (
        <HelpSubTopic topic={subTopic} key={subTopic.id} />
      ))}
    </Content>
  </div>
);

export default InlineSubTopicContent;

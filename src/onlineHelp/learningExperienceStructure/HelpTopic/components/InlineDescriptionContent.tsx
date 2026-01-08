import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { Content } from '@patternfly/react-core';

import { getClassForListStyle, getTextListComponentForListStyle } from '../../../utils/utils';
import HelpSubTopic from '../../HelpSubTopic/HelpSubTopic';

type InlineDescriptionContentProps = {
  subTopic: LearningExperienceSubTopic;
};

const InlineDescriptionContent: FC<InlineDescriptionContentProps> = ({ subTopic }) => {
  return (
    <div className={getClassForListStyle(subTopic.subListStyleType)}>
      <Content component={getTextListComponentForListStyle(subTopic.subListStyleType)}>
        {subTopic
          .subTopics?.()
          .map((nextSubTopic) => <HelpSubTopic key={nextSubTopic.id} topic={nextSubTopic} />)}
      </Content>
    </div>
  );
};

export default InlineDescriptionContent;

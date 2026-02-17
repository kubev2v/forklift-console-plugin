import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { css } from '@patternfly/react-styles';

import ExpandableDescriptionContent from './ExpandableDescriptionContent';
import InlineDescriptionContent from './InlineDescriptionContent';

type DescriptionSubTopicRendererProps = {
  subTopic: LearningExperienceSubTopic;
};

const DescriptionSubTopicRenderer: FC<DescriptionSubTopicRendererProps> = ({ subTopic }) => {
  const hasSubTopics = Boolean(subTopic.subTopics);
  const hasTitle = Boolean(subTopic.title);

  return (
    <div className={css('forklift--learning__help-description', subTopic.className)}>
      {subTopic.title}
      {hasSubTopics && (
        <div className={css('pf-v6-u-mb-md', hasTitle && 'pf-v6-u-mt-md')}>
          {subTopic.expandable ? (
            <ExpandableDescriptionContent subTopic={subTopic} />
          ) : (
            <InlineDescriptionContent subTopic={subTopic} />
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionSubTopicRenderer;

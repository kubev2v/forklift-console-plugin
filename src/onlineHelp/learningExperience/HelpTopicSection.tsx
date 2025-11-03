import { type FC, useState } from 'react';
import HelpSubTopic from 'src/onlineHelp/learningExperience/HelpSubTopic';
import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';
import {
  getClassForListStyle,
  getTextListComponentForListStyle,
} from 'src/onlineHelp/learningExperience/utils';

import { Content, ExpandableSection } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { isEmpty } from '@utils/helpers';

type HelpTopicSectionProps = {
  topic: LearningExperienceSubTopic;
  index: number;
  listStyleType?: ListStyleType;
};

const HelpTopicSection: FC<HelpTopicSectionProps> = ({ index, listStyleType, topic }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const prefix = listStyleType === ListStyleType.DECIMAL ? `${index + 1}.` : null;

  const renderTopicTitle = () => {
    const title = (
      <Content>
        <Content component="p">
          {listStyleType === ListStyleType.DECIMAL ? (
            <>
              {prefix} {topic.title}
            </>
          ) : (
            topic.title
          )}
        </Content>
      </Content>
    );

    if (isEmpty(listStyleType) || listStyleType === ListStyleType.DECIMAL) {
      return title;
    }

    return (
      <div className={getClassForListStyle(listStyleType)}>
        <Content component={listStyleType === ListStyleType.LOWER_ALPHA ? 'ol' : 'ul'}>
          <Content component="li">{title}</Content>
        </Content>
      </div>
    );
  };

  return (
    <ExpandableSection
      className={css(
        'forklift--learning__help-section',
        isEmpty(topic.subTopics) && 'm-non-expandable',
        topic.subListStyleType === ListStyleType.DESCRIPTIONS && 'm-has-descriptions',
      )}
      toggleContent={<div className="pf-v6-u-ml-sm">{renderTopicTitle()}</div>}
      isExpanded={isExpanded}
      onToggle={(_ev, expanded) => {
        if (topic.subTopics) {
          setIsExpanded(expanded);
        }
      }}
    >
      {topic.subTopics ? (
        <div className="pf-v6-u-ml-lg pf-v6-u-mb-md">
          <div
            id={`${topic.id}: ${topic.subListStyleType}`}
            className={getClassForListStyle(topic.subListStyleType)}
          >
            {topic.subListStyleType === ListStyleType.DESCRIPTIONS ? (
              topic.subTopics.map((subTopic) => (
                <HelpSubTopic key={subTopic.id} topic={subTopic} noListItem />
              ))
            ) : (
              <Content component={getTextListComponentForListStyle(topic.subListStyleType)}>
                {topic.subTopics.map((subTopic) => (
                  <HelpSubTopic key={subTopic.id} topic={subTopic} />
                ))}
              </Content>
            )}
          </div>
        </div>
      ) : null}
    </ExpandableSection>
  );
};

export default HelpTopicSection;

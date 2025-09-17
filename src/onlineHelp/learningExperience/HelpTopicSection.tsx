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

import {
  ExpandableSection,
  Text,
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core';
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
      <TextContent>
        <Text component="p">
          {listStyleType === ListStyleType.DECIMAL ? (
            <>
              {prefix} {topic.title}
            </>
          ) : (
            topic.title
          )}
        </Text>
      </TextContent>
    );

    if (isEmpty(listStyleType) || listStyleType === ListStyleType.DECIMAL) {
      return title;
    }

    return (
      <div className={getClassForListStyle(listStyleType)}>
        <TextList component={listStyleType === ListStyleType.LOWER_ALPHA ? 'ol' : 'ul'}>
          <TextListItem>{title}</TextListItem>
        </TextList>
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
      toggleContent={<div className="pf-v5-u-ml-sm">{renderTopicTitle()}</div>}
      isExpanded={isExpanded}
      onToggle={(_ev, expanded) => {
        if (topic.subTopics) {
          setIsExpanded(expanded);
        }
      }}
    >
      {topic.subTopics ? (
        <div className="pf-v5-u-ml-lg pf-v5-u-mb-md">
          <div
            id={`${topic.id}: ${topic.subListStyleType}`}
            className={getClassForListStyle(topic.subListStyleType)}
          >
            {topic.subListStyleType === ListStyleType.DESCRIPTIONS ? (
              topic.subTopics.map((subTopic) => (
                <HelpSubTopic key={subTopic.id} topic={subTopic} noListItem />
              ))
            ) : (
              <TextList component={getTextListComponentForListStyle(topic.subListStyleType)}>
                {topic.subTopics.map((subTopic) => (
                  <HelpSubTopic key={subTopic.id} topic={subTopic} />
                ))}
              </TextList>
            )}
          </div>
        </div>
      ) : null}
    </ExpandableSection>
  );
};

export default HelpTopicSection;

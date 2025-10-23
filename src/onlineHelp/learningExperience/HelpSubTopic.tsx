import type { FC } from 'react';
import HelpTopicSection from 'src/onlineHelp/learningExperience/HelpTopicSection';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/learningExperience/types';
import {
  getClassForListStyle,
  getTextListComponentForListStyle,
} from 'src/onlineHelp/learningExperience/utils';

import { Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

type HelpSubTopicProps = {
  topic: LearningExperienceSubTopic;
  noListItem?: boolean;
};

const HelpSubTopic: FC<HelpSubTopicProps> = ({ noListItem, topic }) => {
  const topicElement = (
    <>
      {topic.title}
      {topic.subTopics ? (
        <div className="pf-v6-u-ml-lg">
          {topic.expandable ? (
            topic.subTopics?.map((subTopic, subIndex) => (
              <HelpTopicSection key={subTopic.id} topic={subTopic} index={subIndex} />
            ))
          ) : (
            <div className={css('pf-v6-u-mt-sm', getClassForListStyle(topic.subListStyleType))}>
              <Content component={getTextListComponentForListStyle(topic.subListStyleType)}>
                {topic.subTopics?.map((subTopic) => (
                  <HelpSubTopic topic={subTopic} key={subTopic.id} />
                ))}
              </Content>
            </div>
          )}
        </div>
      ) : null}
    </>
  );

  return noListItem ? topicElement : <Content component="li">{topicElement}</Content>;
};

export default HelpSubTopic;

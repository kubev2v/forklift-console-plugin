import type { FC } from 'react';
import HelpSubTopic from 'src/onlineHelp/learningExperience/HelpSubTopic';
import HelpTopicSection from 'src/onlineHelp/learningExperience/HelpTopicSection';
import {
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';
import {
  getClassForListStyle,
  getTextListComponentForListStyle,
} from 'src/onlineHelp/learningExperience/utils';

import { Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

type HelpTopicProps = {
  topic: LearningExperienceTopic;
};

const HelpTopic: FC<HelpTopicProps> = ({ topic }) => (
  <>
    <Content>
      <Content component="h3">
        <span className="pf-v6-u-mr-sm">{topic.icon}</span>
        {topic.title}
      </Content>
    </Content>
    <div className="pf-v6-u-mt-lg">
      {topic.subTopics.map((subTopic, index) => {
        if (topic.subListStyleType === ListStyleType.DESCRIPTIONS) {
          return (
            <div key={subTopic.id} className="forklift--learning__help-description">
              {subTopic.title}
              {subTopic.subTopics ? (
                <div className={css('pf-v6-u-mb-md', Boolean(subTopic.title) && 'pf-v6-u-mt-md')}>
                  {subTopic.expandable ? (
                    subTopic.subTopics.map((nextSubTopic, subIndex) => (
                      <HelpTopicSection
                        key={nextSubTopic.id}
                        topic={nextSubTopic}
                        index={subIndex}
                        listStyleType={subTopic.subListStyleType}
                      />
                    ))
                  ) : (
                    <div className={getClassForListStyle(subTopic.subListStyleType)}>
                      <Content
                        component={getTextListComponentForListStyle(subTopic.subListStyleType)}
                      >
                        {subTopic.subTopics.map((nextSubTopic) => (
                          <HelpSubTopic key={nextSubTopic.id} topic={nextSubTopic} />
                        ))}
                      </Content>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        }
        return (
          <HelpTopicSection
            key={subTopic.id}
            index={index}
            topic={subTopic}
            listStyleType={topic.subListStyleType}
          />
        );
      })}
    </div>
  </>
);

export default HelpTopic;

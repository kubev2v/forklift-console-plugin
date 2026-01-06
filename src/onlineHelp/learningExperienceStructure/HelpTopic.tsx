import type { FC } from 'react';
import HelpSubTopic from 'src/onlineHelp/learningExperienceStructure/HelpSubTopic';
import HelpTopicSection from 'src/onlineHelp/learningExperienceStructure/HelpTopicSection';
import {
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { getClassForListStyle, getTextListComponentForListStyle } from './utils/utils';

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
      {topic.subTopics().map((subTopic, index) => {
        if (topic.subListStyleType === ListStyleType.DESCRIPTIONS) {
          return (
            <div key={subTopic.id}>
              {subTopic.title}
              {subTopic.subTopics ? (
                <div className={css('pf-v6-u-mb-md', Boolean(subTopic.title) && 'pf-v6-u-mt-md')}>
                  {subTopic.expandable ? (
                    subTopic
                      .subTopics()
                      .map((nextSubTopic, subIndex) => (
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
                        {subTopic.subTopics().map((nextSubTopic) => (
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

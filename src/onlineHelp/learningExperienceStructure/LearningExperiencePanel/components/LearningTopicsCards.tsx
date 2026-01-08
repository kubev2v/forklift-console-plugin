import { type FC, useContext } from 'react';
import { learningExperienceTopics } from 'src/onlineHelp/learningExperienceContent/topics/utils/constants';
import { LearningExperienceContext } from 'src/onlineHelp/learningExperienceDrawer/context/LearningExperienceContext';

import { Card, CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import { TELEMETRY_EVENTS, TipsTopicSourceComponent } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';

const LearningTopicsCards: FC = () => {
  const { trackEvent } = useForkliftAnalytics();
  const { selectedTopic, setSelectedTopic } = useContext(LearningExperienceContext);

  if (selectedTopic) {
    return null;
  }

  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      {learningExperienceTopics.map((learningExperienceTopic) => {
        const TopicIcon = learningExperienceTopic.icon;
        return (
          <FlexItem key={learningExperienceTopic.id}>
            <Card
              id={learningExperienceTopic.id}
              data-testid="topic-card"
              isClickable
              onClick={() => {
                trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_VISITED, {
                  componentType: TipsTopicSourceComponent.TipsTopicCard,
                  helpTopic: learningExperienceTopic.trackingEventTopic,
                });
                setSelectedTopic(learningExperienceTopic);
              }}
            >
              <CardHeader
                selectableActions={{ selectableActionAriaLabelledby: learningExperienceTopic.id }}
              >
                <CardTitle>
                  <Flex>
                    <FlexItem className="pf-v6-u-mr-sm">
                      <TopicIcon />
                    </FlexItem>
                    <FlexItem>{learningExperienceTopic.title}</FlexItem>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardBody className="pf-v6-u-ml-lg">{learningExperienceTopic.description}</CardBody>
            </Card>
          </FlexItem>
        );
      })}
    </Flex>
  );
};

export default LearningTopicsCards;

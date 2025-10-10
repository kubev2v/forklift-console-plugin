import type { FC } from 'react';

import { Card, CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import { TELEMETRY_EVENTS, TipsTopicSourceComponent } from '@utils/analytics/constants.ts';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics.ts';

import type { LearningExperienceTopic } from './types';

type LearningTopicsCardsProps = {
  topics: LearningExperienceTopic[];
  onSelect: (learningTopic: LearningExperienceTopic) => void;
};

const LearningTopicsCards: FC<LearningTopicsCardsProps> = ({ onSelect, topics }) => {
  const { trackEvent } = useForkliftAnalytics();

  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      {topics.map((learningExperienceTopic) => (
        <FlexItem key={learningExperienceTopic.id}>
          <Card
            id={learningExperienceTopic.id}
            isClickable
            onClick={() => {
              trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_VISITED, {
                componentType: TipsTopicSourceComponent.TipsTopicCard,
                helpTopic: learningExperienceTopic.trackingEventTopic,
              });
              onSelect(learningExperienceTopic);
            }}
          >
            <CardHeader
              selectableActions={{ selectableActionAriaLabelledby: learningExperienceTopic.id }}
            >
              <CardTitle>
                <Flex>
                  <FlexItem className="pf-v6-u-mr-sm">{learningExperienceTopic.icon}</FlexItem>
                  <FlexItem>{learningExperienceTopic.title}</FlexItem>
                </Flex>
              </CardTitle>
            </CardHeader>
            <CardBody className="pf-v6-u-ml-lg">{learningExperienceTopic.description}</CardBody>
          </Card>
        </FlexItem>
      ))}
    </Flex>
  );
};

export default LearningTopicsCards;

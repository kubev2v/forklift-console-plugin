import type { FC } from 'react';

import { Card, CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import type { LearningExperienceTopic } from './types';

type LearningTopicsCardsProps = {
  topics: LearningExperienceTopic[];
  onSelect: (learningTopic: LearningExperienceTopic) => void;
};

const LearningTopicsCards: FC<LearningTopicsCardsProps> = ({ onSelect, topics }) => {
  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      {topics.map((learningExperienceTopic) => (
        <FlexItem key={learningExperienceTopic.id}>
          <Card
            id={learningExperienceTopic.id}
            isClickable
            isRounded
            onClick={() => {
              onSelect(learningExperienceTopic);
            }}
          >
            <CardHeader
              selectableActions={{
                name: learningExperienceTopic.id,
                selectableActionAriaLabelledby: learningExperienceTopic.id,
                selectableActionId: learningExperienceTopic.id,
              }}
            >
              <CardTitle>
                <Flex>
                  <FlexItem className="pf-v5-u-mr-sm">{learningExperienceTopic.icon}</FlexItem>
                  <FlexItem>{learningExperienceTopic.title}</FlexItem>
                </Flex>
              </CardTitle>
            </CardHeader>
            <CardBody className="pf-v5-u-ml-lg">{learningExperienceTopic.description}</CardBody>
          </Card>
        </FlexItem>
      ))}
    </Flex>
  );
};

export default LearningTopicsCards;

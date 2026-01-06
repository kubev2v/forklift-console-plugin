import { type FC, useContext } from 'react';

import { Button, ButtonVariant, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';

import { CreateForkliftContext } from './context/ForkliftContext';

const LearningExperienceHeader: FC = () => {
  const { trackEvent } = useForkliftAnalytics();
  const { isLearningExperienceOpen, openLearningExperience } =
    useContext(CreateForkliftContext).learningExperienceContext;

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex>
          <FlexItem align={{ default: 'alignRight' }}>
            {isLearningExperienceOpen ? undefined : (
              <Button
                variant={ButtonVariant.link}
                isInline
                onClick={() => {
                  trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_CLICKED);
                  openLearningExperience();
                }}
              >
                {TIPS_AND_TRICKS_LABEL}
              </Button>
            )}
          </FlexItem>
        </Flex>
      </PageSection>
    </>
  );
};

export default LearningExperienceHeader;

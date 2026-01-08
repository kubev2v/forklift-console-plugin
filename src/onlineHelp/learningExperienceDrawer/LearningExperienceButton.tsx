import { type FC, useContext } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';

import { LearningExperienceContext } from './context/LearningExperienceContext';

const LearningExperienceButton: FC = () => {
  const { trackEvent } = useForkliftAnalytics();
  const { isLearningExperienceOpen, openLearningExperience } =
    useContext(LearningExperienceContext);

  if (isLearningExperienceOpen) {
    return null;
  }

  return (
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
  );
};

export default LearningExperienceButton;

import { type FC, useContext } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '@utils/i18n';

import { LearningExperienceContext } from './context/LearningExperienceContext';

const LearningExperienceButton: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const { isLearningExperienceOpen, openLearningExperience } =
    useContext(LearningExperienceContext);

  if (isLearningExperienceOpen) {
    return null;
  }

  return (
    <Button
      isInline
      onClick={() => {
        trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_CLICKED);
        openLearningExperience();
      }}
      variant={ButtonVariant.link}
    >
      {t('Tips and tricks')}
    </Button>
  );
};

export default LearningExperienceButton;

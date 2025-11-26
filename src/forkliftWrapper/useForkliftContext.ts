import { useMemo } from 'react';
import type { ForkliftContextType } from 'src/forkliftWrapper/ForkliftContext';
import { useLearningExperienceContext } from 'src/onlineHelp/learningExperience/useLearningExperienceContext';
import { useOverviewContext } from 'src/overview/hooks/useOverviewContext';

export const useForkliftContext = (): ForkliftContextType => {
  const overviewContext = useOverviewContext();
  const learningExperienceContext = useLearningExperienceContext();

  return useMemo(
    () => ({
      learningExperienceContext,
      overviewContext,
    }),
    [learningExperienceContext, overviewContext],
  );
};

import { useMemo } from 'react';
import { useOverviewContext } from 'src/overview/hooks/useOverviewContext';

import type { ForkliftContextType } from '../types/types';

import { useLearningExperienceContext } from './useLearningExperienceContext';

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

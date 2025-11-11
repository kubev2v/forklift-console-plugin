import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { produce } from 'immer';

import type {
  CreateLearningExperienceContextData,
  CreateLearningExperienceContextType,
} from '../types/types';
import {
  loadLearningExperienceContext,
  loadUserSettings,
  saveLearningExperienceContext,
} from '../utils/forkliftLearningExperienceUserSettings';

export const useLearningExperienceContext = (): CreateLearningExperienceContextType => {
  const userSettings = useMemo(() => loadUserSettings('LearningExperience'), []);
  const showLearningExperienceInitState = userSettings?.learningExperienceShow?.show ?? false;
  const { learningExperienceContext: learningExperienceTopic } = loadLearningExperienceContext();

  const [userData, setUserData] = useState<CreateLearningExperienceContextData>({
    learningExperienceContext: learningExperienceTopic,
    showLearningPanelByContext: showLearningExperienceInitState,
  });

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const setValueSafe = useCallback((newValue: CreateLearningExperienceContextData) => {
    if (mounted.current) {
      setUserData(newValue);
    }
  }, []);

  return useMemo(
    () => ({
      setUserData: (newState: CreateLearningExperienceContextData) => {
        // Save/clear the user settings stored in local storage
        if (newState.showLearningPanelByContext) userSettings?.learningExperienceShow?.save(true);
        else userSettings?.learningExperienceShow?.clear();

        saveLearningExperienceContext(newState?.learningExperienceContext);

        setValueSafe(
          produce(userData, (draft) => {
            Object.assign(draft, newState);
          }),
        );
      },
      userData,
    }),
    [userData, setValueSafe, userSettings?.learningExperienceShow],
  );
};

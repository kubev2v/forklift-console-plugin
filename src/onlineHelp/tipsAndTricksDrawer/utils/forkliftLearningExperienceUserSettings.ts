import { saveToLocalStorage } from '@components/common/utils/localStorage';
import { parseOrClean, saveRestOrRemoveKey } from '@utils/userSettingsHelpers';

type ForkliftLearningExperienceUserSettings = {
  learningExperienceShow?: LearningExperienceSettings;
  learningExperienceContext?: number;
};

type LearningExperienceSettings = {
  show?: boolean;
  save: (showPanel: boolean) => void;
  clear: () => void;
};

const getLearningExperienceKey = () => `${process.env.PLUGIN_NAME}/LearningExperience`;

export const saveLearningExperienceContext = (learningExperienceContext?: number) => {
  const key = getLearningExperienceKey();
  const current = parseOrClean<ForkliftLearningExperienceUserSettings>(key);
  saveToLocalStorage(
    key,
    JSON.stringify({
      ...current,
      learningExperienceContext,
    }),
  );
};

export const loadLearningExperienceContext = (): {
  learningExperienceContext?: number;
} => {
  const key = getLearningExperienceKey();
  const { learningExperienceContext } = parseOrClean<ForkliftLearningExperienceUserSettings>(key);
  return { learningExperienceContext };
};

export const loadUserSettings = (
  userSettingsKeySuffix: string,
): ForkliftLearningExperienceUserSettings => {
  const key = `${process.env.PLUGIN_NAME}/${userSettingsKeySuffix}`;
  const { show, ...rest } = parseOrClean<LearningExperienceSettings>(key);

  return {
    learningExperienceShow: {
      clear: () => {
        saveRestOrRemoveKey(key, { rest, showWelcome: { show } });
      },
      save: (showPanel) => {
        saveToLocalStorage(key, JSON.stringify({ ...parseOrClean(key), show: showPanel }));
      },
      show: typeof show === 'boolean' ? show : undefined,
    },
  };
};

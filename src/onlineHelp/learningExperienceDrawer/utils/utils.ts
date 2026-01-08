import { learningExperienceTopics } from 'src/onlineHelp/learningExperienceContent/topics/utils/constants';
import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

import { saveToLocalStorage } from '@components/common/utils/localStorage';
import { isEmpty } from '@utils/helpers';
import { parseOrClean } from '@utils/userSettingsHelpers';

import { STORAGE_KEY } from './constants';
import type { PersistedState } from './types';

export const findTopicById = (
  topicId: string | null | undefined,
): LearningExperienceTopic | null => {
  if (!topicId) return null;
  return learningExperienceTopics.find((topic) => topic.id === topicId) ?? null;
};

let pendingWrites: Partial<PersistedState> = {};
let writeTimeout: ReturnType<typeof setTimeout> | null = null;

const DEBOUNCE_MS = 200;

const flushToStorage = (): void => {
  if (isEmpty(Object.keys(pendingWrites))) return;

  const current = parseOrClean<PersistedState>(STORAGE_KEY);
  saveToLocalStorage(STORAGE_KEY, JSON.stringify({ ...current, ...pendingWrites }));
  pendingWrites = {};
};

export const persistValue = <K extends keyof PersistedState>(
  key: K,
  value: PersistedState[K],
): void => {
  // Accumulate writes
  pendingWrites[key] = value;

  // Reset the debounce timer
  if (writeTimeout) {
    clearTimeout(writeTimeout);
  }

  writeTimeout = setTimeout(flushToStorage, DEBOUNCE_MS);
};

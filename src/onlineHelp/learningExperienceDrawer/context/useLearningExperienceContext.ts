import { useCallback, useMemo, useState } from 'react';
import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

import { parseOrClean } from '@utils/userSettingsHelpers';

import { DEFAULT_DATA, DEFAULT_DRAWER_WIDTH, STORAGE_KEY } from '../utils/constants';
import type { LearningExperienceContextType, PersistedState } from '../utils/types';
import { findTopicById, persistValue } from '../utils/utils';

export const useLearningExperienceContext = (): LearningExperienceContextType => {
  const [persistedState] = useState(() => parseOrClean<PersistedState>(STORAGE_KEY));

  const [isLearningExperienceOpen, setIsLearningExperienceOpen] = useState(
    persistedState.isLearningExperienceOpen ?? false,
  );
  const [openExpansionItems, setOpenExpansionItems] = useState<string[]>(
    persistedState.openExpansionItems ?? [],
  );
  const [scrollPosition, setScrollPosition] = useState(persistedState.scrollPosition ?? 0);
  const [referenceScrollPositions, setReferenceScrollPositions] = useState<Record<string, number>>(
    persistedState.referenceScrollPositions ?? {},
  );
  const [selectedTopic, setSelectedTopic] = useState<LearningExperienceTopic | null>(
    findTopicById(persistedState.selectedTopicId),
  );
  const [drawerWidth, setDrawerWidth] = useState(
    persistedState.drawerWidth ?? DEFAULT_DRAWER_WIDTH,
  );
  const [data, setData] = useState<Record<string, any>>(persistedState.data ?? DEFAULT_DATA);

  const openLearningExperience = useCallback(() => {
    setIsLearningExperienceOpen(true);
    persistValue('isLearningExperienceOpen', true);
  }, []);

  const closeLearningExperience = useCallback(() => {
    setIsLearningExperienceOpen(false);
    persistValue('isLearningExperienceOpen', false);
  }, []);

  const openExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        return prev;
      }
      const newItems = [...prev, itemId];
      persistValue('openExpansionItems', newItems);
      return newItems;
    });
  }, []);

  const closeExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        const newItems = prev.filter((openId) => openId !== itemId);
        persistValue('openExpansionItems', newItems);
        return newItems;
      }
      return prev;
    });
  }, []);

  const setDataItem = useCallback((dataItem: string, value: any): void => {
    setData((prev) => {
      const newData = { ...prev, [dataItem]: value };
      persistValue('data', newData);
      return newData;
    });
  }, []);

  const clearData = useCallback((dataItem?: string): void => {
    setData((prev) => {
      if (!dataItem) {
        persistValue('data', {});
        return {};
      }
      const newData = { ...prev, [dataItem]: undefined };
      persistValue('data', newData);
      return newData;
    });
  }, []);

  const setReferenceScrollPosition = useCallback((id: string, position: number): void => {
    setReferenceScrollPositions((prev) => {
      const newPositions = { ...prev, [id]: position };
      persistValue('referenceScrollPositions', newPositions);
      return newPositions;
    });
  }, []);

  const handleSetScrollPosition = useCallback((position: number): void => {
    setScrollPosition(position);
    persistValue('scrollPosition', position);
  }, []);

  const handleSetDrawerWidth = useCallback((width: string): void => {
    setDrawerWidth(width);
    persistValue('drawerWidth', width);
  }, []);

  const handleSetSelectedTopic = useCallback((topic: LearningExperienceTopic | null): void => {
    setSelectedTopic(topic);
    persistValue('selectedTopicId', topic?.id ?? null);
  }, []);

  return useMemo(
    () => ({
      clearData,
      closeExpansionItem,
      closeLearningExperience,
      data,
      drawerWidth,
      isLearningExperienceOpen,
      openExpansionItem,
      openExpansionItems,
      openLearningExperience,
      referenceScrollPositions,
      scrollPosition,
      selectedTopic,
      setData: setDataItem,
      setDrawerWidth: handleSetDrawerWidth,
      setReferenceScrollPosition,
      setScrollPosition: handleSetScrollPosition,
      setSelectedTopic: handleSetSelectedTopic,
    }),
    [
      clearData,
      closeExpansionItem,
      closeLearningExperience,
      data,
      drawerWidth,
      isLearningExperienceOpen,
      openExpansionItem,
      openExpansionItems,
      openLearningExperience,
      referenceScrollPositions,
      scrollPosition,
      selectedTopic,
      setDataItem,
      handleSetDrawerWidth,
      setReferenceScrollPosition,
      handleSetScrollPosition,
      handleSetSelectedTopic,
    ],
  );
};

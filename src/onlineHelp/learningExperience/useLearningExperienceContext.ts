import { useCallback, useMemo, useState } from 'react';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

import type { LearningExperienceContextType } from './LearningExperienceContext';

export const useLearningExperienceContext = (): LearningExperienceContextType => {
  const [isLearningExperienceOpen, setIsLearningExperienceOpen] = useState(false);
  const [openExpansionItems, setOpenExpansionItems] = useState<string[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<LearningExperienceTopic | undefined>();
  const [data, setData] = useState<Record<string, any>>({
    createProviderTypeSelection: 'vmware-vsphere',
    migrationSource: 'vmware-vsphere',
  });

  const openLearningExperience = useCallback(() => {
    setIsLearningExperienceOpen(true);
  }, []);

  const closeLearningExperience = useCallback(() => {
    setIsLearningExperienceOpen(false);
  }, []);

  const openExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        return prev;
      }
      return [...prev, itemId];
    });
  }, []);

  const closeExpansionItem = useCallback((itemId: string) => {
    setOpenExpansionItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((openId) => openId !== itemId);
      }
      return prev;
    });
  }, []);

  const setDataItem = useCallback((dataItem: string, value: any): void => {
    setData((prev) => {
      return { ...prev, [dataItem]: value };
    });
  }, []);

  const clearData = useCallback((dataItem?: string): void => {
    setData((prev) => {
      if (!dataItem) {
        return {};
      }
      return { ...prev, [dataItem]: undefined };
    });
  }, []);

  return useMemo(
    () => ({
      clearData,
      closeExpansionItem,
      closeLearningExperience,
      data,
      isLearningExperienceOpen,
      openExpansionItem,
      openExpansionItems,
      openLearningExperience,
      scrollPosition,
      selectedTopic,
      setData: setDataItem,
      setScrollPosition,
      setSelectedTopic,
    }),
    [
      clearData,
      closeExpansionItem,
      closeLearningExperience,
      data,
      isLearningExperienceOpen,
      openExpansionItem,
      openExpansionItems,
      openLearningExperience,
      scrollPosition,
      selectedTopic,
      setDataItem,
      setScrollPosition,
      setSelectedTopic,
    ],
  );
};

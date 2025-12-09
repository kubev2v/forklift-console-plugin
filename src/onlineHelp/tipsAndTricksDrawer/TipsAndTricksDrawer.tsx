import { type FC, type PropsWithChildren, useContext, useState } from 'react';

import { Drawer, DrawerContent } from '@patternfly/react-core';

import type { LearningExperienceTopic } from '../learningExperience/types';

import ForkliftLearningExperience from './components/ForkliftLearningExperience';
import TipsAndTricksHeader from './components/TipsAndTricksHeader';
import { createLearningExperienceContext } from './hooks/learningExperienceContext';
import {
  loadLearningExperienceContext,
  saveLearningExperienceContext,
} from './utils/forkliftLearningExperienceUserSettings';
import { indexToTopic, topicToIndex } from './utils/topicToIndexConvertors';

const TipsAndTricksDrawer: FC<PropsWithChildren> = ({ children }) => {
  const { setUserData, userData: { showLearningPanelByContext } = {} } = useContext(
    createLearningExperienceContext,
  );

  const [panelSelectedTopic, setPanelSelectedTopic] = useState<LearningExperienceTopic | undefined>(
    indexToTopic(loadLearningExperienceContext()?.learningExperienceContext),
  );

  const setIsDrawerOpen = (isOpen: boolean) => {
    setUserData({ showLearningPanelByContext: isOpen });
  };

  const setSelectedTopic = (topic?: LearningExperienceTopic) => {
    saveLearningExperienceContext(topicToIndex(topic));
    setPanelSelectedTopic(topic);
  };

  return (
    <Drawer isInline isExpanded={showLearningPanelByContext} position="right">
      <DrawerContent
        panelContent={
          <ForkliftLearningExperience
            setIsDrawerOpen={setIsDrawerOpen}
            setSelectedTopic={setSelectedTopic}
            selectedTopic={panelSelectedTopic}
          />
        }
      >
        <TipsAndTricksHeader
          isDrawerOpen={showLearningPanelByContext}
          setIsDrawerOpen={setIsDrawerOpen}
        />
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default TipsAndTricksDrawer;

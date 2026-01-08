import { type FC, type ReactNode, useContext, useEffect } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import LearningExperiencePanel from '../learningExperienceStructure/LearningExperiencePanel/LearningExperiencePanel';

import { LearningExperienceContext } from './context/LearningExperienceContext';

const LearningExperienceDrawer: FC<{ children: ReactNode }> = ({ children }) => {
  const { isLearningExperienceOpen } = useContext(LearningExperienceContext);

  // eslint-disable-next-line @typescript-eslint/consistent-return
  useEffect(() => {
    const listWrapper: HTMLElement | null = document.querySelector(
      '#content-scrollable .co-m-list',
    );

    if (listWrapper) {
      const originalOverflow = listWrapper.style.overflowY;
      listWrapper.style.overflowY = 'hidden';

      return () => {
        listWrapper.style.overflowY = originalOverflow;
      };
    }
  }, []);

  return (
    <Drawer isInline isExpanded={isLearningExperienceOpen} position="right">
      <DrawerContent panelContent={<LearningExperiencePanel />}>
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default LearningExperienceDrawer;

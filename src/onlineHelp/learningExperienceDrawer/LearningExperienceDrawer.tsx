import { type FC, type ReactNode, useContext, useEffect } from 'react';
import LearningExperienceHeader from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceHeader';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import LearningExperienceContentMain from '../learningExperienceContent/LearningExperienceContentMain';

import { CreateForkliftContext } from './context/ForkliftContext';

const LearningExperienceDrawer: FC<{ children: ReactNode }> = ({ children }) => {
  const { isLearningExperienceOpen } = useContext(CreateForkliftContext).learningExperienceContext;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listWrapper: any = document.querySelector('#content-scrollable .co-m-list');

    if (listWrapper) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      listWrapper.style.overflowY = 'hidden';
    }
  }, []);

  return (
    <Drawer isInline isExpanded={isLearningExperienceOpen} position="right">
      <DrawerContent panelContent={<LearningExperienceContentMain />}>
        <LearningExperienceHeader />
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default LearningExperienceDrawer;

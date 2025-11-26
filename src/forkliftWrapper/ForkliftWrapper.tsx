import { type FC, type ReactNode, useContext, useEffect } from 'react';
import { CreateForkliftContext } from 'src/forkliftWrapper/ForkliftContext';
import ForkliftLearningExperience from 'src/onlineHelp/forkliftHelp/ForkliftLearningExperience';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

const ForkliftWrapper: FC<{ children: ReactNode }> = ({ children }) => {
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
      <DrawerContent panelContent={<ForkliftLearningExperience />}>
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ForkliftWrapper;

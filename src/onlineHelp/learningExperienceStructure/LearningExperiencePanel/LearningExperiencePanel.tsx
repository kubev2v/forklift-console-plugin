import { type FC, useContext } from 'react';
import ExternalLinksSection from 'src/onlineHelp/learningExperienceContent/externalLinksSection/ExternalLinksSection';
import QuickReferencesSection from 'src/onlineHelp/learningExperienceContent/quickReferencesSection/QuickReferencesSection';

import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';

import { LearningExperienceContext } from '../../learningExperienceDrawer/context/LearningExperienceContext';
import HelpTopic from '../HelpTopic/HelpTopic';

import LearningExperienceSelect from './components/LearningExperienceSelect';
import LearningTopicsCards from './components/LearningTopicsCards';
import { useScrollPositionPersistence } from './hooks/useScrollPositionPersistence';

import '@patternfly/quickstarts/dist/quickstarts.css';
import './LearningExperiencePanel.scss';

const LearningExperiencePanel: FC = () => {
  const {
    closeLearningExperience,
    drawerWidth,
    isLearningExperienceOpen,
    scrollPosition,
    setDrawerWidth,
    setScrollPosition,
    setSelectedTopic,
  } = useContext(LearningExperienceContext);

  const panelContentRef = useScrollPositionPersistence({
    isActive: isLearningExperienceOpen,
    onPositionChange: setScrollPosition,
    savedPosition: scrollPosition,
  });

  return (
    <DrawerPanelContent
      isResizable
      defaultSize={drawerWidth}
      onResize={(_event, width) => {
        setDrawerWidth(`${width}px`);
      }}
      className="pfext-quick-start__base forklift--learning"
    >
      <div ref={panelContentRef} className="forklift--learning__panel">
        <div className="pfext-quick-start-panel-content pfext-quick-start-panel-content__header pfext-quick-start-panel-content__header--blue-white forklift--learning__header">
          <DrawerHead>
            <div className="pfext-quick-start-panel-content__title" tabIndex={-1}>
              <Title headingLevel="h2" size="xl">
                {TIPS_AND_TRICKS_LABEL}
              </Title>
            </div>
            <DrawerActions>
              <DrawerCloseButton
                className="pfext-quick-start-panel-content__close-button"
                onClick={() => {
                  closeLearningExperience();
                  setSelectedTopic(null);
                }}
              />
            </DrawerActions>
            <LearningExperienceSelect />
          </DrawerHead>
        </div>
        <DrawerPanelBody className="pfext-quick-start-panel-content__body">
          <HelpTopic />
          <LearningTopicsCards />
          <QuickReferencesSection />
          <ExternalLinksSection />
        </DrawerPanelBody>
      </div>
    </DrawerPanelContent>
  );
};

export default LearningExperiencePanel;

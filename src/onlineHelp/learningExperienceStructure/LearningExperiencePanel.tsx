/* eslint-disable @cspell/spellchecker */
import { type FC, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import HelpTopic from 'src/onlineHelp/learningExperienceStructure/HelpTopic';
import LearningExperienceSelect from 'src/onlineHelp/learningExperienceStructure/LearningExperienceSelect';
import LearningTopicsCards from 'src/onlineHelp/learningExperienceStructure/LearningTopicsCards';

import {
  debounce,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { CreateForkliftContext } from '../learningExperienceDrawer/context/ForkliftContext';

import type { LearningExperienceTopic } from './utils/types';

import '@patternfly/quickstarts/dist/quickstarts.css';
import './LearningExperiencePanel.scss';

type LearningExperiencePanelProps = {
  topics: LearningExperienceTopic[];
  footer: ReactNode;
};

const LearningExperiencePanel: FC<LearningExperiencePanelProps> = ({ footer, topics }) => {
  useForkliftTranslation();
  const { learningExperienceContext } = useContext(CreateForkliftContext);
  const {
    closeLearningExperience,
    scrollPosition,
    selectedTopic,
    setScrollPosition,
    setSelectedTopic,
  } = learningExperienceContext;

  const [scrollable, setScrollable] = useState<HTMLDivElement | null>();
  const debouncedSetPositionRef = useRef(debounce(setScrollPosition, 500));
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only update the scroll position when creating a new scrollable (not on a data update)
    if (scrollable && !elementRef.current) {
      elementRef.current = scrollable;
      scrollable.scrollTop = scrollPosition;
    }
  }, [scrollable, scrollPosition]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      debouncedSetPositionRef.current((event.currentTarget as any)?.scrollTop);
    };

    if (scrollable) {
      scrollable.addEventListener('scroll', handleScroll);
    }

    // Cleanup the event listener on unmount
    return () => {
      if (scrollable) {
        scrollable.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollable]);

  const panelContentRef = (element: HTMLDivElement | null) => {
    setScrollable(element);
  };

  return (
    <DrawerPanelContent isResizable className="pfext-quick-start__base forklift--learning">
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
                  setSelectedTopic(undefined);
                }}
              />
            </DrawerActions>
            <LearningExperienceSelect
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          </DrawerHead>
        </div>
        <DrawerPanelBody className="pfext-quick-start-panel-content__body">
          {selectedTopic ? (
            <HelpTopic topic={selectedTopic} />
          ) : (
            <LearningTopicsCards onSelect={setSelectedTopic} topics={topics} />
          )}
          {footer}
        </DrawerPanelBody>
      </div>
    </DrawerPanelContent>
  );
};

export default LearningExperiencePanel;

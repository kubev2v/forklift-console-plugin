/* eslint-disable @cspell/spellchecker */
import { type FC, useState } from 'react';
import HelpTopic from 'src/onlineHelp/learningExperience/HelpTopic';
import LearningExperienceSelect from 'src/onlineHelp/learningExperience/LearningExperienceSelect';
import LearningTopicsCards from 'src/onlineHelp/learningExperience/LearningTopicsCards';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import '@patternfly/quickstarts/dist/quickstarts.css';
import './LearningExperiencePanel.scss';

type LearningExperiencePanelProps = {
  topics: LearningExperienceTopic[];
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const LearningExperiencePanel: FC<LearningExperiencePanelProps> = ({ setIsDrawerOpen, topics }) => {
  const { t } = useForkliftTranslation();
  const [selectedTopic, setSelectedTopic] = useState<LearningExperienceTopic | undefined>();

  return (
    <DrawerPanelContent isResizable className="pfext-quick-start__base forklift--learning">
      <div className="pfext-quick-start-panel-content__header pfext-quick-start-panel-content__header--blue-white forklift--learning__header">
        <DrawerHead>
          <div className="pfext-quick-start-panel-content__title" tabIndex={-1}>
            <Title
              headingLevel="h2"
              size="xl"
              className="pfext-quick-start-panel-content__name"
              style={{ marginRight: 'var(--pf-v5-global--spacer--md)' }}
            >
              {t('Tips and tricks')}
            </Title>
          </div>
          <DrawerActions>
            <DrawerCloseButton
              className="pfext-quick-start-panel-content__close-button"
              onClick={() => {
                setIsDrawerOpen(false);
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
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default LearningExperiencePanel;

import { type FC, type Ref, useState } from 'react';

import {
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { TELEMETRY_EVENTS, TipsTopicSourceComponent } from '@utils/analytics/constants.ts';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics.ts';
import { useForkliftTranslation } from '@utils/i18n';

import type { LearningExperienceTopic } from './types';

import './LearningExperiencePanel.scss';

type LearningExperienceSelectProps = {
  topics: LearningExperienceTopic[];
  selectedTopic?: LearningExperienceTopic;
  setSelectedTopic: (selectedTopic?: LearningExperienceTopic) => void;
};

const LearningExperienceSelect: FC<LearningExperienceSelectProps> = ({
  selectedTopic,
  setSelectedTopic,
  topics,
}) => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    return (
      <MenuToggle
        className="pf-v6-u-mt-md"
        ref={toggleRef}
        onClick={() => {
          setIsSelectOpen((prev) => !prev);
        }}
        isExpanded={isSelectOpen}
        style={{ width: '100%' }}
      >
        <Flex flexWrap={{ default: 'nowrap' }} spacer={{ default: 'spacerSm' }}>
          <FlexItem>
            <BarsIcon />
          </FlexItem>
          <FlexItem>{selectedTopic?.title ?? t('Select a topic')}</FlexItem>
        </Flex>
      </MenuToggle>
    );
  };

  return (
    <PfSelect
      selected={selectedTopic}
      toggle={toggle}
      isOpen={isSelectOpen}
      onOpenChange={(isOpen) => {
        setIsSelectOpen(isOpen);
      }}
      onSelect={(_ev, value) => {
        const newSelection = topics.find((topic) => topic.id === value);
        if (newSelection) {
          trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_VISITED, {
            componentType: TipsTopicSourceComponent.TipsTopicSelect,
            helpTopic: newSelection.trackingEventTopic,
          });
          setSelectedTopic(newSelection);
        }
        setIsSelectOpen(false);
      }}
    >
      <SelectList>
        {topics.map((topic) => (
          <SelectOption value={topic.id} key={topic.id}>
            {topic.title}
          </SelectOption>
        ))}
      </SelectList>
    </PfSelect>
  );
};

export default LearningExperienceSelect;

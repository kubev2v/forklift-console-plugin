import { type FC, type Ref, useContext, useState } from 'react';
import { learningExperienceTopics } from 'src/onlineHelp/learningExperienceContent/topics/utils/constants';
import { LearningExperienceContext } from 'src/onlineHelp/learningExperienceDrawer/context/LearningExperienceContext';

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
import { TELEMETRY_EVENTS, TipsTopicSourceComponent } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '@utils/i18n';

import '../LearningExperiencePanel.scss';

const LearningExperienceSelect: FC = () => {
  const { t } = useForkliftTranslation();
  const { selectedTopic, setSelectedTopic } = useContext(LearningExperienceContext);
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
          <FlexItem>{t('Select a topic')}</FlexItem>
        </Flex>
      </MenuToggle>
    );
  };

  return (
    <PfSelect
      selected={selectedTopic?.id}
      toggle={toggle}
      isOpen={isSelectOpen}
      onOpenChange={(isOpen) => {
        setIsSelectOpen(isOpen);
      }}
      onSelect={(_ev, value) => {
        const newSelection = learningExperienceTopics.find((topic) => topic.id === value);
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
        {learningExperienceTopics.map((topic) => (
          <SelectOption value={topic.id} key={topic.id}>
            {topic.title}
          </SelectOption>
        ))}
      </SelectList>
    </PfSelect>
  );
};

export default LearningExperienceSelect;

import { type FC, type Ref, useState } from 'react';

import {
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import type { LearningExperienceTopic } from './types';

import './LearningExperiencePanel.scss';

type Props = {
  topics: LearningExperienceTopic[];
  selectedTopic?: LearningExperienceTopic;
  setSelectedTopic: (selectedTopic?: LearningExperienceTopic) => void;
};

const LearningExperienceSelect: FC<Props> = ({ selectedTopic, setSelectedTopic, topics }) => {
  const { t } = useForkliftTranslation();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    return (
      <MenuToggle
        className="pf-v5-u-mt-md"
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
    // eslint-disable-next-line no-restricted-syntax
    <Select
      selected={selectedTopic}
      toggle={toggle}
      isOpen={isSelectOpen}
      onOpenChange={(isOpen) => {
        setIsSelectOpen(isOpen);
      }}
      onSelect={(_ev, value) => {
        setSelectedTopic(topics.find((topic) => topic.id === value));
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
    </Select>
  );
};

export default LearningExperienceSelect;

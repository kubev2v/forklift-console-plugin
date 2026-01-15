import { type FC, type ReactNode, useContext } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import { LearningExperienceContext } from '../../learningExperienceDrawer/context/LearningExperienceContext';
import { useScrollPositionPersistence } from '../LearningExperiencePanel/hooks/useScrollPositionPersistence';

import ExpandedContent from './components/ExpandedContent';
import ToggleButton from './components/ToggleButton';

type ReferenceSectionProps = {
  id: string;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
};

const ReferenceSection: FC<ReferenceSectionProps> = ({ children, icon, id, title }) => {
  const {
    closeExpansionItem,
    openExpansionItem,
    openExpansionItems,
    referenceScrollPositions,
    setReferenceScrollPosition,
  } = useContext(LearningExperienceContext);

  const isExpanded = openExpansionItems.includes(id);

  const scrollableRef = useScrollPositionPersistence({
    isActive: isExpanded,
    onPositionChange: (position) => {
      setReferenceScrollPosition(id, position);
    },
    savedPosition: referenceScrollPositions[id] ?? 0,
  });

  const handleToggle = () => {
    if (isExpanded) {
      closeExpansionItem(id);
    } else {
      openExpansionItem(id);
    }
  };

  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      <FlexItem>
        <ToggleButton icon={icon} title={title} isExpanded={isExpanded} onToggle={handleToggle} />
      </FlexItem>
      {isExpanded && <ExpandedContent scrollableRef={scrollableRef}>{children}</ExpandedContent>}
    </Flex>
  );
};

export default ReferenceSection;

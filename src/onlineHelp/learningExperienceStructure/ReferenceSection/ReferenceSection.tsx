import { type FC, memo, type ReactNode, useContext } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import { AccordionContext } from '../../learningExperienceDrawer/context/AccordionContext';
import { LearningExperienceContext } from '../../learningExperienceDrawer/context/LearningExperienceContext';
import { useScrollPositionPersistence } from '../LearningExperiencePanel/hooks/useScrollPositionPersistence';

import ExpandedContent from './components/ExpandedContent';
import ToggleButton from './components/ToggleButton';

type ReferenceSectionProps = {
  children?: ReactNode;
  icon: ReactNode;
  id: string;
  title: string;
};

const ReferenceSection: FC<ReferenceSectionProps> = ({ children, icon, id, title }) => {
  const { closeExpansionItem, openExpansionItem, openExpansionItems } =
    useContext(AccordionContext);
  const { referenceScrollPositions, setReferenceScrollPosition } =
    useContext(LearningExperienceContext);

  const isExpanded = openExpansionItems.includes(id);

  const scrollableRef = useScrollPositionPersistence({
    isActive: isExpanded,
    onPositionChange: (position) => {
      setReferenceScrollPosition(id, position);
    },
    savedPosition: referenceScrollPositions[id] ?? 0,
  });

  const handleToggle = (): void => {
    if (isExpanded) {
      closeExpansionItem(id);
    } else {
      openExpansionItem(id);
    }
  };

  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      <FlexItem>
        <ToggleButton icon={icon} isExpanded={isExpanded} onToggle={handleToggle} title={title} />
      </FlexItem>
      {isExpanded && <ExpandedContent scrollableRef={scrollableRef}>{children}</ExpandedContent>}
    </Flex>
  );
};

export default memo(ReferenceSection);

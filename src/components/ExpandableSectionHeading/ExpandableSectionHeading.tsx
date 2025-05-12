import type { FC, ReactNode } from 'react';
import useToggle from 'src/modules/Providers/hooks/useToggle';

import SectionHeading from '@components/headers/SectionHeading';
import { Button, ButtonVariant, Flex } from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

import './ExpandableSectionHeading.scss';

type ExpandableSectionHeadingProps = {
  section: ReactNode;
  sectionTitle: ReactNode;
  initialExpanded?: boolean;
};

const ExpandableSectionHeading: FC<ExpandableSectionHeadingProps> = ({
  initialExpanded = false,
  section,
  sectionTitle,
}) => {
  const [showSection, setShowSection] = useToggle(initialExpanded);
  return (
    <>
      <Button
        className="expandable-section-heading"
        isInline
        variant={ButtonVariant.plain}
        onClick={setShowSection}
      >
        <SectionHeading
          text={
            <Flex
              className="expandable-section-heading__title"
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapSm' }}
            >
              {showSection ? <AngleDownIcon /> : <AngleRightIcon />}
              <>{sectionTitle}</>
            </Flex>
          }
        />
      </Button>
      {showSection && section}
    </>
  );
};

export default ExpandableSectionHeading;

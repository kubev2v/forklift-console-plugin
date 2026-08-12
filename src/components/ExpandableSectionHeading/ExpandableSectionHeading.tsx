import type { FC, ReactNode } from 'react';
import useToggle from 'src/utils/hooks/useToggle';

import SectionHeading from '@components/headers/SectionHeading';
import { Button, ButtonVariant, Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon, HelpIcon } from '@patternfly/react-icons';

import './ExpandableSectionHeading.scss';

type ExpandableSectionHeadingProps = {
  initialExpanded?: boolean;
  section: ReactNode;
  sectionHelpTip?: ReactNode;
  sectionTitle: ReactNode;
};

const ExpandableSectionHeading: FC<ExpandableSectionHeadingProps> = ({
  initialExpanded = false,
  section,
  sectionHelpTip,
  sectionTitle,
}) => {
  const [showSection, setShowSection] = useToggle(initialExpanded);
  return (
    <>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Button
            className="expandable-section-heading"
            icon={
              <SectionHeading
                text={
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    className="expandable-section-heading__title"
                    gap={{ default: 'gapSm' }}
                  >
                    <FlexItem>{showSection ? <AngleDownIcon /> : <AngleRightIcon />}</FlexItem>
                    <FlexItem>{sectionTitle}</FlexItem>
                  </Flex>
                }
              />
            }
            isInline
            onClick={setShowSection}
            variant={ButtonVariant.plain}
          />
        </FlexItem>
        {sectionHelpTip ? (
          <FlexItem>
            <Tooltip content={sectionHelpTip}>
              <Icon size="md">
                <HelpIcon />
              </Icon>
            </Tooltip>
          </FlexItem>
        ) : null}
      </Flex>
      {showSection && section}
    </>
  );
};

export default ExpandableSectionHeading;

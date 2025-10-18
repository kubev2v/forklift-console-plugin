import type { FC, ReactNode } from 'react';
import useToggle from 'src/modules/Providers/hooks/useToggle';

import SectionHeading from '@components/headers/SectionHeading';
import { Button, ButtonVariant, Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon, HelpIcon } from '@patternfly/react-icons';

import './ExpandableSectionHeading.scss';

type ExpandableSectionHeadingProps = {
  section: ReactNode;
  sectionTitle: ReactNode;
  sectionHelpTip?: ReactNode;
  initialExpanded?: boolean;
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
            icon={
              <SectionHeading
                text={
                  <Flex
                    className="expandable-section-heading__title"
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapSm' }}
                  >
                    <FlexItem>{showSection ? <AngleDownIcon /> : <AngleRightIcon />}</FlexItem>
                    <FlexItem>{sectionTitle}</FlexItem>
                  </Flex>
                }
              />
            }
            className="expandable-section-heading"
            isInline
            variant={ButtonVariant.plain}
            onClick={setShowSection}
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

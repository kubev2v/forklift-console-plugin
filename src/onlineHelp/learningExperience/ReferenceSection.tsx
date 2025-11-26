import { type FC, type ReactNode, useContext } from 'react';
import { CreateForkliftContext } from 'src/forkliftWrapper/ForkliftContext';

import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';

type ReferenceSectionProps = {
  id: string;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
};

const ReferenceSection: FC<ReferenceSectionProps> = ({ children, icon, id, title }) => {
  const { closeExpansionItem, openExpansionItem, openExpansionItems } =
    useContext(CreateForkliftContext).learningExperienceContext;

  const isExpanded = openExpansionItems.includes(id);

  return (
    <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
      <FlexItem>
        <Button
          variant={ButtonVariant.link}
          isInline
          onClick={() => {
            if (isExpanded) {
              closeExpansionItem(id);
            } else {
              openExpansionItem(id);
            }
          }}
          style={{ width: '100%' }}
        >
          <Flex
            direction={{ default: 'row' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spacer={{ default: 'spacerMd' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>
              <Flex
                direction={{ default: 'row' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spacer={{ default: 'spacerNone' }}
                flexWrap={{ default: 'nowrap' }}
              >
                <FlexItem>{icon}</FlexItem>
                <FlexItem>{title}</FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>{isExpanded ? <AngleUpIcon /> : <AngleDownIcon />}</FlexItem>
          </Flex>
        </Button>
      </FlexItem>
      {isExpanded ? (
        <FlexItem>
          <div className="forklift--learning__reference-items">{children}</div>
        </FlexItem>
      ) : null}
    </Flex>
  );
};

export default ReferenceSection;

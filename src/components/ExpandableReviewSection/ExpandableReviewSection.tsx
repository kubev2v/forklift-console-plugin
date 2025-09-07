import { type FC, type PropsWithChildren, useState } from 'react';

import {
  Button,
  ButtonVariant,
  ExpandableSection,
  type ExpandableSectionProps,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import './ExpandableReviewSection.style.scss';

type ExpandableReviewSectionProps = PropsWithChildren &
  Pick<ExpandableSectionProps, 'title'> & {
    onEditClick?: () => void;
    testId?: string;
  };

const ExpandableReviewSection: FC<ExpandableReviewSectionProps> = ({
  children,
  onEditClick,
  testId,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <ExpandableSection
      className="expandable-review-section pf-v5-w-100"
      data-testid={testId}
      toggleContent={
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <Title headingLevel="h3">{title}</Title>

          <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
            <Button
              variant={ButtonVariant.link}
              onClick={(event) => {
                event.stopPropagation();

                onEditClick?.();
              }}
            >
              {t('Edit step')}
            </Button>
          </FlexItem>
        </Flex>
      }
      isExpanded={isExpanded}
      onToggle={(_, isSectionExpanded) => {
        setIsExpanded(isSectionExpanded);
      }}
      allowFullScreen
    >
      <div className="pf-v5-u-p-lg pf-v5-u-pt-0">{children}</div>
    </ExpandableSection>
  );
};

export default ExpandableReviewSection;

import { type FC, type PropsWithChildren, useState } from 'react';

import {
  Button,
  ButtonVariant,
  ExpandableSection,
  type ExpandableSectionProps,
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
    <div className="expandable-review-section-wrapper">
      <ExpandableSection
        className="expandable-review-section pf-v6-w-100"
        data-testid={testId}
        toggleContent={<Title headingLevel="h3">{title}</Title>}
        isExpanded={isExpanded}
        onToggle={(_, isSectionExpanded) => {
          setIsExpanded(isSectionExpanded);
        }}
        isIndented
        allowFullScreen
      >
        <div className="pf-v6-u-pb-lg pf-v6-u-pt-md">{children}</div>
      </ExpandableSection>
      {onEditClick && (
        <Button
          className="expandable-review-section-wrapper__edit-button"
          variant={ButtonVariant.link}
          onClick={onEditClick}
        >
          {t('Edit step')}
        </Button>
      )}
    </div>
  );
};

export default ExpandableReviewSection;

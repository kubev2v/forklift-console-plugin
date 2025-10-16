import type { FC } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type ReviewStepErrorStateProps = {
  error: string;
  onBackToReviewClick: () => void;
};

const ReviewStepErrorState: FC<ReviewStepErrorStateProps> = ({ error, onBackToReviewClick }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState
      titleText={t('Failed to create plan')}
      headingLevel="h4"
      icon={ExclamationCircleIcon}
      className="pf-v6-u-h-100"
    >
      <EmptyStateBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <FlexItem>{error}</FlexItem>

          <EmptyStateActions>
            <Button variant={ButtonVariant.primary} onClick={onBackToReviewClick}>
              {t('Go back to review step')}
            </Button>
          </EmptyStateActions>
        </Flex>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default ReviewStepErrorState;

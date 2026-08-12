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
      className="pf-v6-u-h-100"
      headingLevel="h4"
      icon={ExclamationCircleIcon}
      titleText={t('Failed to create plan')}
    >
      <EmptyStateBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <FlexItem>{error}</FlexItem>

          <EmptyStateActions>
            <Button onClick={onBackToReviewClick} variant={ButtonVariant.primary}>
              {t('Go back to review step')}
            </Button>
          </EmptyStateActions>
        </Flex>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default ReviewStepErrorState;

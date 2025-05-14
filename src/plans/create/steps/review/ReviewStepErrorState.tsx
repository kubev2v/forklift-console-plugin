import type { FC } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import * as PatternflyTokens from '@patternfly/react-tokens';
import { useForkliftTranslation } from '@utils/i18n';

type ReviewStepErrorStateProps = {
  error: string;
  onBackToReviewClick: () => void;
};

const ReviewStepErrorState: FC<ReviewStepErrorStateProps> = ({ error, onBackToReviewClick }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState className="pf-v5-u-h-100">
      <EmptyStateHeader
        titleText={t('Failed to create plan')}
        headingLevel="h4"
        icon={
          <EmptyStateIcon
            icon={ExclamationCircleIcon}
            color={PatternflyTokens.global_danger_color_100.var}
          />
        }
      />
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

import type { FC } from 'react';

import WizardStepContainer from '@components/common/WizardStepContainer';
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
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import * as PatternflyTokens from '@patternfly/react-tokens';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';

import GeneralInfoReviewSection from './GeneralInfoReviewSection';
import HooksReviewSection from './HooksReviewSection';
import MigrationTypeReviewSection from './MigrationTypeReviewSection';
import NetworkMapReviewSection from './NetworkMapReviewSection';
import OtherSettingsReviewSection from './OtherSettingsReviewSection';
import StorageMapReviewSection from './StorageMapReviewSection';
import VirtualMachinesReviewSection from './VirtualMachinesReviewSection';

type ReviewStepProps = {
  isLoading: boolean;
  error: Error | undefined;
  onBackToReviewClick: () => void;
};

const ReviewStep: FC<ReviewStepProps> = ({ error, isLoading, onBackToReviewClick }) => {
  const { t } = useForkliftTranslation();

  if (isLoading) {
    return (
      <EmptyState className="pf-v5-u-h-100">
        <EmptyStateHeader
          titleText={t('Creating plan')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>
    );
  }

  if (error?.message) {
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
            <FlexItem>{error.message}</FlexItem>

            <EmptyStateActions>
              <Button variant={ButtonVariant.primary} onClick={onBackToReviewClick}>
                {t('Go back to review step')}
              </Button>
            </EmptyStateActions>
          </Flex>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.ReviewAndCreate]}
      description={t(
        'Make sure your migration plan looks correct. To make any changes, click directly on the step you want to go to or press the back button.',
      )}
    >
      <GeneralInfoReviewSection />
      <VirtualMachinesReviewSection />
      <NetworkMapReviewSection />
      <StorageMapReviewSection />
      <MigrationTypeReviewSection />
      <OtherSettingsReviewSection />
      <HooksReviewSection />
    </WizardStepContainer>
  );
};

export default ReviewStep;

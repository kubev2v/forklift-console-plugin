import type { FC } from 'react';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { EmptyState, EmptyStateHeader, EmptyStateIcon, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';

import GeneralInfoReviewSection from './GeneralInfoReviewSection';
import HooksReviewSection from './HooksReviewSection';
import MigrationTypeReviewSection from './MigrationTypeReviewSection';
import NetworkMapReviewSection from './NetworkMapReviewSection';
import OtherSettingsReviewSection from './OtherSettingsReviewSection';
import ReviewStepErrorState from './ReviewStepErrorState';
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
    return <ReviewStepErrorState error={error.message} onBackToReviewClick={onBackToReviewClick} />;
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

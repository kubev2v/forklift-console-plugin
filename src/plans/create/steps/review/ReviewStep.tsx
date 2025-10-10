import type { FC } from 'react';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { EmptyState, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import GeneralInfoReviewSection from './GeneralInfoReviewSection';
import HooksReviewSection from './HooksReviewSection';
import MigrationTypeReviewSection from './MigrationTypeReviewSection';
import NetworkMapReviewSection from './NetworkMapReviewSection';
import OtherSettingsReviewSection from './OtherSettingsReviewSection';
import ReviewStepErrorState from './ReviewStepErrorState';
import StorageMapReviewSection from './StorageMapReviewSection';
import VirtualMachinesReviewSection from './VirtualMachinesReviewSection';

type ReviewStepProps = {
  error: Error | undefined;
  onBackToReviewClick: () => void;
  isLiveMigrationEnabled: boolean;
};

const ReviewStep: FC<ReviewStepProps> = ({
  error,
  isLiveMigrationEnabled,
  onBackToReviewClick,
}) => {
  const { t } = useForkliftTranslation();
  const {
    formState: { isSubmitting },
  } = useCreatePlanFormContext();

  if (isSubmitting) {
    return (
      <EmptyState
        titleText={t('Creating plan')}
        headingLevel="h4"
        icon={Spinner}
        className="pf-v6-u-h-100"
      />
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
      testId="create-plan-review-step"
    >
      <GeneralInfoReviewSection />
      <VirtualMachinesReviewSection />
      <NetworkMapReviewSection />
      <StorageMapReviewSection />
      <MigrationTypeReviewSection isLiveMigrationEnabled={isLiveMigrationEnabled} />
      <OtherSettingsReviewSection />
      <HooksReviewSection />
    </WizardStepContainer>
  );
};

export default ReviewStep;

import type { FC } from 'react';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { EmptyState, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import CustomScriptsReviewSection from './CustomScriptsReviewSection';
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
  isLiveMigrationFeatureEnabled: boolean;
  onBackToReviewClick: () => void;
};

const ReviewStep: FC<ReviewStepProps> = ({
  error,
  isLiveMigrationFeatureEnabled,
  onBackToReviewClick,
}) => {
  const { t } = useForkliftTranslation();
  const {
    formState: { isSubmitting },
  } = useCreatePlanFormContext();

  if (isSubmitting) {
    return (
      <EmptyState
        className="pf-v6-u-h-100"
        headingLevel="h4"
        icon={Spinner}
        titleText={t('Creating plan')}
      />
    );
  }

  if (error?.message) {
    return <ReviewStepErrorState error={error.message} onBackToReviewClick={onBackToReviewClick} />;
  }

  return (
    <WizardStepContainer
      description={t(
        'Make sure your migration plan looks correct. To make any changes, click directly on the step you want to go to or press the back button.',
      )}
      testId="create-plan-review-step"
      title={planStepNames[PlanWizardStepId.ReviewAndCreate]}
    >
      <GeneralInfoReviewSection />
      <VirtualMachinesReviewSection />
      <NetworkMapReviewSection />
      <StorageMapReviewSection />
      <MigrationTypeReviewSection isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled} />
      <OtherSettingsReviewSection isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled} />
      <CustomScriptsReviewSection />
      <HooksReviewSection />
    </WizardStepContainer>
  );
};

export default ReviewStep;

import type { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { EmptyState, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

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
    control,
    formState: { isSubmitting },
  } = useCreatePlanFormContext();
  const sourceProvider = useWatch({ control, name: GeneralFormFieldId.SourceProvider });
  const isEc2 = sourceProvider?.spec?.type === PROVIDER_TYPES.ec2;

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
      {!isEc2 && <NetworkMapReviewSection />}
      {!isEc2 && <StorageMapReviewSection />}
      <MigrationTypeReviewSection isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled} />
      <OtherSettingsReviewSection isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled} />
      <CustomScriptsReviewSection />
      <HooksReviewSection />
    </WizardStepContainer>
  );
};

export default ReviewStep;

import { type FC, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router';

import { Wizard, WizardStep, type WizardStepType } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { GeneralFormFieldId } from './steps/general-information/constants';
import GeneralInformationStep from './steps/general-information/GeneralInformationStep';
import HooksStep from './steps/hooks/HooksStep';
import MigrationTypeStep from './steps/migration-type/MigrationTypeStep';
import { NetworkMapFieldId } from './steps/network-map/constants';
import NetworkMapStep from './steps/network-map/NetworkMapStep';
import OtherSettingsStep from './steps/other-settings/OtherSettingsStep';
import ReviewStep from './steps/review/ReviewStep';
import { StorageMapFieldId } from './steps/storage-map/constants';
import StorageMapStep from './steps/storage-map/StorageMapStep';
import { VmFormFieldId } from './steps/virtual-machines/constants';
import VirtualMachinesStep from './steps/virtual-machines/VirtualMachinesStep';
import { firstStep, planStepNames, planStepOrder, PlanWizardStepId } from './constants';
import CreatePlanWizardFooter from './CreatePlanWizardFooter';
import { useCreatePlanForm, useDefaultFormValues } from './hooks';
import { getCreatedPlanPath, handlePlanSubmission, hasWarmMigrationProviderType } from './utils';

import './CreatePlanWizard.style.scss';

const CreatePlanWizard: FC = () => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState<WizardStepType>(firstStep);
  const [createPlanError, setCreatePlanError] = useState<Error>();
  const [isCreating, setIsCreating] = useState(false);

  const defaultValues = useDefaultFormValues();
  const form = useCreatePlanForm({
    defaultValues,
    mode: 'onChange',
  });
  const hasCreatePlanError = Boolean(createPlanError?.message);

  const { control, formState } = form;
  const [planName, planProject, sourceProvider, targetProvider, vms, networkMap, storageMap] =
    useWatch({
      control,
      name: [
        GeneralFormFieldId.PlanName,
        GeneralFormFieldId.PlanProject,
        GeneralFormFieldId.SourceProvider,
        GeneralFormFieldId.TargetProvider,
        VmFormFieldId.Vms,
        NetworkMapFieldId.NetworkMap,
        StorageMapFieldId.StorageMap,
      ],
    });

  const onSubmit = async () => {
    setCreatePlanError(undefined);
    setIsCreating(true);

    try {
      await handlePlanSubmission({
        networkMap,
        planName,
        planProject,
        sourceProvider,
        storageMap,
        targetProvider,
        vms: Object.values(vms),
      });

      // Navigate to the created plan
      history.push(getCreatedPlanPath(planName, planProject));
    } catch (error) {
      if (error instanceof Error) {
        setCreatePlanError(error);
      } else {
        setCreatePlanError(new Error('An unknown error occurred'));
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getStepProps = (id: PlanWizardStepId) => ({
    id,
    isDisabled:
      (currentStep?.index < planStepOrder[id] && !isEmpty(formState?.errors)) ||
      isCreating ||
      hasCreatePlanError,
    name: planStepNames[id],
    ...((isCreating || hasCreatePlanError) && { body: null }),
  });

  return (
    <FormProvider {...form}>
      <Wizard
        isVisitRequired
        footer={<CreatePlanWizardFooter />}
        onStepChange={(_event, step) => {
          setCurrentStep(step);
        }}
        className="create-plan-wizard"
      >
        <WizardStep
          {...getStepProps(PlanWizardStepId.BasicSetup)}
          steps={[
            <WizardStep key={PlanWizardStepId.General} {...getStepProps(PlanWizardStepId.General)}>
              <GeneralInformationStep />
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.VirtualMachines}
              {...getStepProps(PlanWizardStepId.VirtualMachines)}
            >
              <VirtualMachinesStep />
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.NetworkMap}
              {...getStepProps(PlanWizardStepId.NetworkMap)}
            >
              <NetworkMapStep />
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.StorageMap}
              {...getStepProps(PlanWizardStepId.StorageMap)}
            >
              <StorageMapStep />
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.MigrationType}
              {...getStepProps(PlanWizardStepId.MigrationType)}
              isHidden={!hasWarmMigrationProviderType(sourceProvider)}
            >
              <MigrationTypeStep />
            </WizardStep>,
          ]}
        />

        <WizardStep
          {...getStepProps(PlanWizardStepId.AdditionalSetup)}
          steps={[
            <WizardStep
              key={PlanWizardStepId.OtherSettings}
              {...getStepProps(PlanWizardStepId.OtherSettings)}
            >
              <OtherSettingsStep />
            </WizardStep>,
            <WizardStep key={PlanWizardStepId.Hooks} {...getStepProps(PlanWizardStepId.Hooks)}>
              <HooksStep />
            </WizardStep>,
          ]}
        />

        <WizardStep
          footer={
            <CreatePlanWizardFooter
              nextButtonText={t('Create plan')}
              onNext={onSubmit}
              isLoading={isCreating}
              hasError={hasCreatePlanError}
            />
          }
          {...getStepProps(PlanWizardStepId.ReviewAndCreate)}
        >
          <ReviewStep
            isLoading={isCreating}
            error={createPlanError}
            onBackToReviewClick={() => {
              setCreatePlanError(undefined);
            }}
          />
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

export default CreatePlanWizard;

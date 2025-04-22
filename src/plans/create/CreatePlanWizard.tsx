import { type FC, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import { Form, Title, Wizard, WizardStep, type WizardStepType } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { GeneralInformationStep } from './steps/general-information/GeneralInformationStep';
import { VirtualMachinesStep } from './steps/virtual-machines/VirtualMachinesStep';
import { firstStep, planStepNames, planStepOrder, PlanWizardStepId } from './constants';
import { CreatePlanWizardFooter } from './CreatePlanWizardFooter';
import { useCreatePlanForm, useDefaultFormValues } from './hooks';

export const CreatePlanWizard: FC = () => {
  const { t } = useForkliftTranslation();
  const defaultValues = useDefaultFormValues();
  const form = useCreatePlanForm({
    defaultValues,
    mode: 'onChange',
  });
  const [currentStep, setCurrentStep] = useState<WizardStepType>(firstStep);
  const { formState, watch } = form;
  const formValues = watch();

  // TODO, Normalize wizard data object and submit
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSubmit = () => {};

  const getStepProps = (id: PlanWizardStepId) => ({
    id,
    isDisabled: currentStep?.index < planStepOrder[id] && !isEmpty(formState?.errors),
    name: planStepNames[id],
  });

  return (
    <FormProvider {...form}>
      <Wizard
        isVisitRequired
        title={t('Create migration plan')}
        footer={<CreatePlanWizardFooter />}
        onStepChange={(_event, step) => {
          setCurrentStep(step);
        }}
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
              key={PlanWizardStepId.NetworkMapping}
              {...getStepProps(PlanWizardStepId.NetworkMapping)}
            >
              <Form>
                <Title headingLevel="h2">{t('Network mappings')}</Title>
              </Form>
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.StorageMapping}
              {...getStepProps(PlanWizardStepId.StorageMapping)}
            >
              <Form>
                <Title headingLevel="h2">{t('Storage mappings')}</Title>
              </Form>
            </WizardStep>,
            <WizardStep
              key={PlanWizardStepId.MigrationType}
              {...getStepProps(PlanWizardStepId.MigrationType)}
            >
              <Form>
                <Title headingLevel="h2">{t('Migration type')}</Title>
              </Form>
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
              <Form>
                <Title headingLevel="h2">{t('Other settings')}</Title>
              </Form>
            </WizardStep>,
            <WizardStep key={PlanWizardStepId.Hooks} {...getStepProps(PlanWizardStepId.Hooks)}>
              <Form>
                <Title headingLevel="h2">{t('Hooks')}</Title>
              </Form>
            </WizardStep>,
          ]}
        />

        <WizardStep
          footer={<CreatePlanWizardFooter nextButtonText={t('Create plan')} onNext={onSubmit} />}
          {...getStepProps(PlanWizardStepId.ReviewAndCreate)}
        >
          <pre>{JSON.stringify(formValues, null, 2)}</pre>
        </WizardStep>
      </Wizard>
    </FormProvider>
  );
};

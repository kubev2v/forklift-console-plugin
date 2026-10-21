import { type FC, useCallback, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import { VddkSetupMode } from 'src/providers/utils/constants';
import { getProviderDetailsPageUrl } from 'src/providers/utils/getProviderDetailsPageUrl';
import { isProviderUsingCopyAppliance } from 'src/providers/utils/isProviderUsingCopyAppliance';

import { Alert, AlertVariant, Form, Wizard, WizardStep } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from './fields/constants';
import { useCreateProviderWorkflow } from './hooks/useCreateProviderWorkflow';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import {
  EMPTY_COPY_APPLIANCE_PLACEMENT,
  PROVIDER_DETAILS_STEP_ID,
  PROVIDER_PLACEMENT_STEP_ID,
} from './utils/wizardConstants';
import CreateProviderFormContextProvider from './CreateProviderFormContextProvider';
import CreateProviderPlacementStep from './CreateProviderPlacementStep';
import CreateProviderWizardFooter from './CreateProviderWizardFooter';
import ProviderTypeFields from './ProviderTypeFields';
import type { CreateProviderFormData } from './types';

import './CreateProviderForm.style.scss';

const VALID_PROVIDER_TYPES = new Set<string>(Object.values(PROVIDER_TYPES));
const CreateProviderForm: FC = () => {
  const { t } = useForkliftTranslation();
  const [searchParams] = useSearchParams();
  const [placement, setPlacement] = useState<CopyAppliancePlacementValues>(
    EMPTY_COPY_APPLIANCE_PLACEMENT,
  );
  const [canDeploy, setCanDeploy] = useState(false);
  const urlProviderType = searchParams.get('providerType');
  const validatedProviderType =
    urlProviderType && VALID_PROVIDER_TYPES.has(urlProviderType) ? urlProviderType : undefined;
  const form = useForm<CreateProviderFormData>({
    defaultValues: getDefaultFormValues('', validatedProviderType),
    mode: 'onChange',
  });
  const {
    control,
    formState: { isSubmitting, isValid },
    handleSubmit,
  } = form;
  const [selectedProject, selectedProviderType, diskTransferMethod] = useWatch({
    control,
    name: [
      ProviderFormFieldId.ProviderProject,
      ProviderFormFieldId.ProviderType,
      ProviderFormFieldId.VsphereVddkSetupMode,
    ],
  });
  const {
    apiError,
    createdProvider,
    isDeploying,
    isProviderPersisted,
    isSecretCreated,
    onCreate,
    onDeploy,
  } = useCreateProviderWorkflow({ canDeploy, handleSubmit, placement });
  const canRetryProviderOnly =
    isSecretCreated && !isProviderPersisted && selectedProviderType === PROVIDER_TYPES.vsphere;
  const isApplianceSelected = createdProvider
    ? isProviderUsingCopyAppliance(createdProvider)
    : selectedProviderType === PROVIDER_TYPES.vsphere &&
      diskTransferMethod === VddkSetupMode.CopyAppliance;
  const createdProviderUrl = createdProvider && getProviderDetailsPageUrl(createdProvider);
  const onPlacementChange = useCallback((field: CopyApplianceSettingField, value: string): void => {
    setPlacement((current) => ({ ...current, [field]: value }));
  }, []);

  return (
    <FormProvider {...form}>
      <CreateProviderFormContextProvider namespace={selectedProject ?? ''}>
        <Wizard
          className="create-provider-wizard"
          data-testid="create-provider-wizard"
          footer={
            <CreateProviderWizardFooter
              canCreate={isValid}
              canDeploy={canDeploy}
              createdProviderUrl={createdProviderUrl}
              isApplianceSelected={isApplianceSelected}
              isSubmitting={isSubmitting || isDeploying}
              onCreate={onCreate}
              onDeploy={onDeploy}
            />
          }
          isVisitRequired
          nav={{ isExpanded: true }}
        >
          <WizardStep
            id={PROVIDER_DETAILS_STEP_ID}
            isDisabled={Boolean(createdProvider)}
            name={t('Provider details')}
          >
            <Form aria-label={t('Provider details')} className="create-provider-form">
              <fieldset
                className="create-provider-form__fields"
                disabled={
                  isSubmitting ||
                  Boolean(createdProvider) ||
                  isProviderPersisted ||
                  (isSecretCreated && !canRetryProviderOnly)
                }
              >
                <ProviderTypeFields lockSecretFields={canRetryProviderOnly} />
              </fieldset>
              {apiError && !createdProvider && (
                <Alert isInline title={t('Error creating provider')} variant={AlertVariant.danger}>
                  {apiError.message}
                </Alert>
              )}
            </Form>
          </WizardStep>
          <WizardStep
            id={PROVIDER_PLACEMENT_STEP_ID}
            isDisabled={!createdProvider}
            isHidden={!isApplianceSelected}
            name={t('Sourcing appliance')}
          >
            {createdProvider && (
              <>
                <CreateProviderPlacementStep
                  onChange={onPlacementChange}
                  onValidChange={setCanDeploy}
                  provider={createdProvider}
                  values={placement}
                />
                {apiError && (
                  <Alert
                    isInline
                    title={t('Error deploying sourcing appliance')}
                    variant={AlertVariant.danger}
                  >
                    {apiError.message}
                  </Alert>
                )}
              </>
            )}
          </WizardStep>
        </Wizard>
      </CreateProviderFormContextProvider>
    </FormProvider>
  );
};

export default CreateProviderForm;

import type { FC } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { VddkSetupMode, VSphereEndpointType } from 'src/providers/utils/constants';
import { getProviderDetailsPageUrl } from 'src/providers/utils/getProviderDetailsPageUrl';
import { isProviderUsingCopyAppliance } from 'src/providers/utils/isProviderUsingCopyAppliance';
import { isVSphereEsxiProvider } from 'src/providers/utils/vsphere/datacenter';

import { Alert, AlertVariant, Form, Wizard, WizardStep } from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from './fields/constants';
import { useCreateProviderDatacenter } from './hooks/useCreateProviderDatacenter';
import { useCreateProviderPlacement } from './hooks/useCreateProviderPlacement';
import { useCreateProviderWorkflow } from './hooks/useCreateProviderWorkflow';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import { PROVIDER_DETAILS_STEP_ID } from './utils/wizardConstants';
import { createProviderDatacenterWizardStep } from './CreateProviderDatacenterWizardStep';
import CreateProviderFormContextProvider from './CreateProviderFormContextProvider';
import CreateProviderWizardFooter from './CreateProviderWizardFooter';
import ProviderTypeFields from './ProviderTypeFields';
import type { CreateProviderFormData } from './types';

import './CreateProviderForm.style.scss';

const VALID_PROVIDER_TYPES = new Set<string>(Object.values(PROVIDER_TYPES));
const CreateProviderForm: FC = () => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [selectedProject, selectedProviderType, diskTransferMethod, endpointType] = useWatch({
    control,
    name: [
      ProviderFormFieldId.ProviderProject,
      ProviderFormFieldId.ProviderType,
      ProviderFormFieldId.VsphereVddkSetupMode,
      ProviderFormFieldId.VsphereEndpointType,
    ],
  });
  const {
    apiError,
    canCreateCopyApplianceTemplate,
    createdProvider,
    isDeploying,
    isProviderPersisted,
    onCancel,
    onCreate,
    onDeploy,
  } = useCreateProviderWorkflow({ handleSubmit });
  const placement = useCreateProviderPlacement(createdProvider);
  const isApplianceSelected = createdProvider
    ? isProviderUsingCopyAppliance(createdProvider)
    : selectedProviderType === PROVIDER_TYPES.vsphere &&
      diskTransferMethod === VddkSetupMode.CopyAppliance;
  const isDatacenterStepVisible = createdProvider
    ? getType(createdProvider) === PROVIDER_TYPES.vsphere && !isVSphereEsxiProvider(createdProvider)
    : selectedProviderType === PROVIDER_TYPES.vsphere && endpointType !== VSphereEndpointType.ESXi;
  const datacenter = useCreateProviderDatacenter(
    isDatacenterStepVisible && placement.connection.isReady
      ? placement.connection.provider
      : undefined,
    isApplianceSelected,
  );
  const canDeploy =
    placement.canDeploy &&
    canCreateCopyApplianceTemplate &&
    (!isApplianceSelected || !isEmpty(datacenter.value));
  const createdProviderUrl = createdProvider && getProviderDetailsPageUrl(createdProvider);
  const canFinish = Boolean(createdProviderUrl) && !datacenter.isPending;

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
              canFinish={canFinish}
              createdProviderUrl={createdProviderUrl}
              isApplianceSelected={isApplianceSelected}
              isDatacenterPending={datacenter.isPending}
              isSubmitting={isSubmitting || isDeploying}
              onCancel={onCancel}
              onCreate={onCreate}
              onDeploy={async () => {
                await onDeploy({ canDeploy, placement: placement.values });
              }}
              onFinish={async (): Promise<void> => {
                if (createdProviderUrl) {
                  navigate(createdProviderUrl)?.catch(() => undefined);
                }
                return Promise.resolve();
              }}
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
                disabled={isSubmitting || Boolean(createdProvider) || isProviderPersisted}
              >
                <ProviderTypeFields />
              </fieldset>
              {apiError && !createdProvider && (
                <Alert isInline title={t('Error creating provider')} variant={AlertVariant.danger}>
                  {apiError.message}
                </Alert>
              )}
            </Form>
          </WizardStep>
          {createProviderDatacenterWizardStep({
            apiError,
            canCreateCopyApplianceTemplate,
            createdProvider,
            datacenter,
            isApplianceSelected,
            isVisible: isDatacenterStepVisible,
            placement,
          })}
        </Wizard>
      </CreateProviderFormContextProvider>
    </FormProvider>
  );
};

export default CreateProviderForm;

import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const AzureCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { getValues } = useCreateProviderFormContext();

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.AzureTenantId}
        helperText={t('Azure Active Directory tenant ID for the service principal')}
        label={t('Tenant ID')}
        testId="azure-tenant-id-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.AzureSubscriptionId}
        helperText={t('Azure subscription that contains the source virtual machines')}
        label={t('Subscription ID')}
        testId="azure-subscription-id-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.AzureClientId}
        helperText={t('Service principal application (client) ID')}
        label={t('Client ID')}
        testId="azure-client-id-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.AzureClientSecret}
        helperText={t('Service principal client secret')}
        label={t('Client secret')}
        testId="azure-client-secret-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.AzureResourceGroup}
        fieldRules={{
          deps: [ProviderFormFieldId.AzureSnapshotResourceGroup],
          validate: (value: string) => {
            const snapshotResourceGroup = getValues(ProviderFormFieldId.AzureSnapshotResourceGroup);

            return (
              Boolean(value?.trim() || snapshotResourceGroup?.trim()) ||
              t('Enter a resource group or a snapshot resource group')
            );
          },
        }}
        helperText={t(
          'Resource group that contains the source virtual machines. Leave empty to discover all resource groups in the subscription.',
        )}
        isRequired={false}
        label={t('Resource group')}
        testId="azure-resource-group-input"
      />
    </>
  );
};

export default AzureCredentialsFields;

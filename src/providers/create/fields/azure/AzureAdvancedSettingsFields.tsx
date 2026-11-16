import { type FC, useState } from 'react';
import { Controller } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from '@components/common/Select';
import { ExpandableSection, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

import { AZURE_DEFAULT_SNAPSHOT_SKU, AZURE_SNAPSHOT_SKU_OPTIONS } from './constants';

const AzureAdvancedSettingsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getValues } = useCreateProviderFormContext();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      data-testid="azure-advanced-settings"
      isExpanded={isExpanded}
      onToggle={(_event, expanded: boolean) => {
        setIsExpanded(expanded);
      }}
      toggleText={t('Advanced settings')}
    >
      <Stack hasGutter>
        <ProviderFormTextInput
          fieldId={ProviderFormFieldId.AzureSnapshotResourceGroup}
          fieldRules={{
            deps: [ProviderFormFieldId.AzureResourceGroup],
            validate: (value: string) => {
              const resourceGroup = getValues(ProviderFormFieldId.AzureResourceGroup);

              return (
                Boolean(value?.trim() || resourceGroup?.trim()) ||
                t('Enter a resource group or a snapshot resource group')
              );
            },
          }}
          helperText={t(
            'Resource group where snapshots are created. Required when the credentials resource group is empty.',
          )}
          isRequired={false}
          label={t('Snapshot resource group')}
          testId="azure-snapshot-resource-group-input"
        />

        <Controller
          control={control}
          defaultValue={AZURE_DEFAULT_SNAPSHOT_SKU}
          name={ProviderFormFieldId.AzureSnapshotSku}
          render={({ field: { onChange, value } }) => (
            <FormGroupWithHelpText
              fieldId={ProviderFormFieldId.AzureSnapshotSku}
              helperText={t('Storage SKU used for the disk snapshots. Defaults to Standard_LRS.')}
              label={t('Snapshot SKU')}
              testId="azure-snapshot-sku-helper"
            >
              <Select
                id="azure-snapshot-sku-select"
                onSelect={(_event, selection) => {
                  onChange(selection);
                }}
                options={[...AZURE_SNAPSHOT_SKU_OPTIONS]}
                testId="azure-snapshot-sku-select"
                value={value}
              />
            </FormGroupWithHelpText>
          )}
        />

        <ProviderFormTextInput
          fieldId={ProviderFormFieldId.AzureTargetRegion}
          helperText={t(
            'Target Azure region for cross-region migration. When empty, snapshots stay in the source region.',
          )}
          isRequired={false}
          label={t('Target region')}
          testId="azure-target-region-input"
        />

        <ProviderFormTextInput
          fieldId={ProviderFormFieldId.AzureVolumeSnapshotClassName}
          helperText={t(
            'VolumeSnapshotClass used to restore snapshots. Discovered from the disk.csi.azure.com driver when empty.',
          )}
          isRequired={false}
          label={t('VolumeSnapshotClass name')}
          testId="azure-volume-snapshot-class-input"
        />
      </Stack>
    </ExpandableSection>
  );
};

export default AzureAdvancedSettingsFields;

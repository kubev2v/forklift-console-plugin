import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1PlanSpecTransferNetwork,
} from '@kubev2v/types';
import { FormGroup, FormHelperText, SelectList, SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import {
  defaultTransferNetwork,
  otherFormFieldLabels,
  OtherSettingsFormFieldId,
} from './constants';

const TransferNetworkField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const targetProvider = useWatch({ control, name: GeneralFormFieldId.TargetProvider });

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider: targetProvider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const transferNetworks: V1beta1PlanSpecTransferNetwork[] = useMemo(
    () =>
      (networks ?? []).map((network) => ({
        apiVersion: network.object.apiVersion,
        kind: network.object.kind,
        name: network.name,
        namespace: network.namespace,
        uid: network.uid,
      })),
    [networks],
  );

  return (
    <FormGroup
      fieldId={OtherSettingsFormFieldId.TransferNetwork}
      label={otherFormFieldLabels[OtherSettingsFormFieldId.TransferNetwork]}
      labelHelp={
        <HelpIconPopover header={otherFormFieldLabels[OtherSettingsFormFieldId.TransferNetwork]}>
          {t(
            'You can select a migration network. If you do not select a migration network, the default migration network is set to the providers default transfer network.',
          )}
        </HelpIconPopover>
      }
    >
      <Controller
        name={OtherSettingsFormFieldId.TransferNetwork}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={field.name}
            value={field.value?.name ?? ''}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={defaultTransferNetwork}
          >
            <SelectList>
              <SelectOption description={t('Use the default target provider transfer network')}>
                {defaultTransferNetwork}
              </SelectOption>

              {transferNetworks.map((network) => (
                <SelectOption
                  key={network.uid ?? network.name}
                  value={network}
                  description={network.namespace}
                >
                  {network.name}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        )}
      />

      <FormHelperText>
        {t('Please choose a NetworkAttachmentDefinition for data transfer.')}
      </FormHelperText>
    </FormGroup>
  );
};

export default TransferNetworkField;

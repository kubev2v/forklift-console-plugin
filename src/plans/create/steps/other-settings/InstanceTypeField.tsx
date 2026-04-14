import { type FC, useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { NO_INSTANCE_TYPE } from 'src/plans/constants';
import { useInstanceTypeOptions } from 'src/plans/hooks/useInstanceTypeOptions';

import Select from '@components/common/Select';
import {
  Flex,
  FlexItem,
  FormGroup,
  FormHelperText,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { ProviderVirtualMachine } from '../../types';
import { VmFormFieldId } from '../virtual-machines/constants';

import { OtherSettingsFormFieldId } from './constants';

import './InstanceTypeField.scss';

const InstanceTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();

  const vms: Record<string, ProviderVirtualMachine> = useWatch({
    control,
    name: VmFormFieldId.Vms,
  });

  const currentInstanceTypes: Record<string, string> = useWatch({
    control,
    name: OtherSettingsFormFieldId.InstanceTypes,
  });

  const { loaded, options } = useInstanceTypeOptions();

  const vmEntries = useMemo(() => Object.entries(vms ?? {}), [vms]);

  const handleInstanceTypeChange = useCallback(
    (vmId: string, selectedValue: string | undefined): void => {
      const updated = { ...currentInstanceTypes };

      if (selectedValue) {
        updated[vmId] = selectedValue;
      } else {
        delete updated[vmId];
      }

      setValue(OtherSettingsFormFieldId.InstanceTypes, updated);
    },
    [currentInstanceTypes, setValue],
  );

  if (isEmpty(vmEntries)) {
    return null;
  }

  return (
    <FormGroup fieldId={OtherSettingsFormFieldId.InstanceTypes} label={t('Instance types')}>
      <Stack hasGutter>
        <FormHelperText>
          {t(
            'Optionally select an instance type for each VM to override its CPU and memory after migration.',
          )}
        </FormHelperText>

        <Stack hasGutter>
          {vmEntries.map(([vmId, vm]) => {
            const selectedValue = currentInstanceTypes?.[vmId];
            return (
              <StackItem key={vmId}>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsMd' }}
                >
                  <FlexItem className="instance-type-field__vm-name">{vm.name}</FlexItem>
                  <FlexItem grow={{ default: 'grow' }}>
                    <Select
                      id={`instance-type-${vmId}`}
                      testId={`instance-type-select-${vmId}`}
                      value={selectedValue ?? NO_INSTANCE_TYPE}
                      options={options}
                      isDisabled={!loaded}
                      onSelect={(_event, val) => {
                        handleInstanceTypeChange(
                          vmId,
                          val === NO_INSTANCE_TYPE ? undefined : String(val),
                        );
                      }}
                      placeholder={t('Select instance type')}
                    />
                  </FlexItem>
                </Flex>
              </StackItem>
            );
          })}
        </Stack>
      </Stack>
    </FormGroup>
  );
};

export default InstanceTypeField;

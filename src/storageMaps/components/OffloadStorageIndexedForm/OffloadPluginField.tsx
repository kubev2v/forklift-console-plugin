import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import { FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

import { useOffloadPlugins } from '../../hooks/useOffloadPlugins';
import { getPluginLabel } from '../../utils/labelHelpers';
import { offloadNestedFieldRules } from '../../utils/offloadNestedFieldRules';

type OffloadPluginFieldProps = { fieldId: string };

const OffloadPluginField: FC<OffloadPluginFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { loading, offloadPlugins } = useOffloadPlugins();

  const options = useMemo(
    () =>
      offloadPlugins.map((plugin) => ({
        label: getPluginLabel(plugin),
        value: plugin,
      })),
    [offloadPlugins],
  );

  return (
    <FormGroup
      fieldId={fieldId}
      label={storageMapFieldLabels[StorageMapFieldId.OffloadPlugin]}
      labelHelp={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Offload plugins accelerate disk copy by using storage-array capabilities instead of pulling data through the source host.',
              )}
            </StackItem>
            <StackItem>
              {t(
                'vSphere XCOPY copies disks on the storage array using ESXi. CSI Volume Import uses the destination storage system to import the source volume directly.',
              )}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={fieldId}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting || loading}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            options={options}
            placeholder={t('Select offload plugin')}
            ref={field.ref}
            testId={fieldId}
            value={field.value}
          />
        )}
        rules={offloadNestedFieldRules}
      />
    </FormGroup>
  );
};

export default OffloadPluginField;

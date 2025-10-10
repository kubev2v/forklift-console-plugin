import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import { FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import { useOffloadPlugins } from '../../hooks/useOffloadPlugins';
import { getPluginLabel } from '../../utils/labelHelpers';

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
                'Enables hardware-assisted copying by instructing the vSphere ESXi host to transfer data directly on the storage backend using technologies like XCOPY and VAAI.',
              )}
            </StackItem>
            <StackItem>
              {t(
                'This significantly speeds up the migration process and frees up network and host resources by avoiding the need to pull data through the source host.',
              )}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            isDisabled={isSubmitting || loading}
            value={field.value}
            options={options}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select offload plugin')}
          />
        )}
      />
    </FormGroup>
  );
};

export default OffloadPluginField;

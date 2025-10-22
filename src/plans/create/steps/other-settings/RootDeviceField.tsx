import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Stack, StackItem, TextInput } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const RootDeviceField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const fieldId = OtherSettingsFormFieldId.RootDevice;

  return (
    <FormGroupWithHelpText
      fieldId={fieldId}
      label={otherFormFieldLabels[fieldId]}
      labelHelp={
        <HelpIconPopover header={otherFormFieldLabels[fieldId]}>
          <ForkliftTrans>
            <Stack hasGutter>
              <StackItem>
                A root device is the storage device or partition that contains the root filesystem.
                For example, naming a root device "/dev/sda2" would mean to use the second partition
                on the first hard drive.
              </StackItem>

              <StackItem>
                If you do not provide a root device, the first root device will be used. If the
                named root device does not exist or is not detected as a root device, the migration
                will fail.
              </StackItem>

              <StackItem>
                <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
                  Learn more
                </ExternalLink>
              </StackItem>
            </Stack>
          </ForkliftTrans>
        </HelpIconPopover>
      }
      helperText={t(
        'Provide the storage device or partition that contains the root filesystem. If left blank, the first root device will be used.',
      )}
    >
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <TextInput
            id={field.name}
            value={field.value}
            onChange={(_event, value) => {
              field.onChange(value);
            }}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default RootDeviceField;

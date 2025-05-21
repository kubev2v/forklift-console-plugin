import type { FC } from 'react';
import { Controller } from 'react-hook-form';
import { diskOptions } from 'src/plans/details/tabs/Details/components/SettingsSection/components/RootDisk/utils/constants';
import { getRootDiskLabelByKey } from 'src/plans/details/tabs/Details/components/SettingsSection/components/RootDisk/utils/utils';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/MtvSelect';
import { FormGroup, SelectList, SelectOption, Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import { useCreatePlanFormContext } from '../../hooks';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const RootDeviceField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const fieldId = OtherSettingsFormFieldId.RootDevice;

  return (
    <FormGroup
      fieldId={fieldId}
      label={otherFormFieldLabels[fieldId]}
      labelIcon={
        <HelpIconPopover header={otherFormFieldLabels[fieldId]}>
          <ForkliftTrans>
            <Stack hasGutter>
              <StackItem>
                Default behavior is to choose the first root device in the case of a multi-boot
                operating system. Since this is a heuristic, it may sometimes choose the wrong one.
              </StackItem>

              <StackItem>
                When using a multi-boot VM, you can also name a specific root device, eg.{' '}
                <strong>/dev/sda2</strong> would mean to use the second partition on the first hard
                drive. If the named root device does not exist or was not detected as a root device,
                the migration will fail.
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
    >
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={field.name}
            value={field.value}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={t('First root device')}
          >
            <SelectList>
              {diskOptions.map(({ description, key }) => (
                <SelectOption key={key} value={key} description={description}>
                  {getRootDiskLabelByKey(String(key))}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        )}
      />
    </FormGroup>
  );
};

export default RootDeviceField;

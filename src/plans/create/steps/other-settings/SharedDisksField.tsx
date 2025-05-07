import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Checkbox, FormGroup, FormHelperText, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const SharedDisksField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const fieldId = OtherSettingsFormFieldId.SharedDisks;
  const label = otherFormFieldLabels[fieldId];

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      labelIcon={
        <HelpIconPopover header={label}>
          {t(
            'If virtual machines are using shared disks, the shared disks will migrate only once by default.',
          )}
        </HelpIconPopover>
      }
      className="checkbox-form-group"
    >
      <Stack hasGutter>
        <FormHelperText>
          {t('Choose whether to migrate share disks with your migration.')}
        </FormHelperText>

        <Controller
          name={fieldId}
          defaultValue={false}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={fieldId}
              label={label}
              isChecked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Stack>
    </FormGroup>
  );
};

export default SharedDisksField;

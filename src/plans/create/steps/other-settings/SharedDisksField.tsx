import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Checkbox, FormGroup, FormHelperText, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const SharedDisksField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const fieldId = OtherSettingsFormFieldId.MigrateSharedDisks;
  const label = otherFormFieldLabels[fieldId];

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      labelHelp={
        <HelpIconPopover header={label}>
          {t(
            'MTV behavior is based on the Shared disks setting in the plan. If checked, the shared disks will be migrated, otherwise the shared disks will not be migrated.',
          )}
        </HelpIconPopover>
      }
      className="checkbox-form-group"
    >
      <Stack hasGutter>
        <FormHelperText>
          {t('Choose whether to migrate shared disks with your migration.')}
        </FormHelperText>

        <Controller
          name={fieldId}
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

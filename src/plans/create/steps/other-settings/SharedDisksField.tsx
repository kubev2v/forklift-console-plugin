import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Checkbox, FormGroup, FormHelperText, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const SharedDisksField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const fieldId = OtherSettingsFormFieldId.MigrateSharedDisks;
  const label = otherFormFieldLabels[fieldId];

  const [migrateSharedDisks, sourceProvider] = useWatch({
    control,
    name: [fieldId, GeneralFormFieldId.SourceProvider],
  });
  const isVddkInitImageNotSet =
    sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere &&
    isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);

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

        {!migrateSharedDisks && isVddkInitImageNotSet && <PlanVddkForSharedDisksWarningAlert />}
      </Stack>
    </FormGroup>
  );
};

export default SharedDisksField;

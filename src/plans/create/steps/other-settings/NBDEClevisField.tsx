import { Controller } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const NBDEClevisField = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  return (
    <FormGroup
      label={otherFormFieldLabels[OtherSettingsFormFieldId.NBDEClevis]}
      labelIcon={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Automatically decrypt LUKS-encrypted disks using Tang servers during migration. The Tang servers must be accessible from the OpenShift cluster.',
              )}
            </StackItem>
            <StackItem>
              {t(
                'Use this instead of manual passphrases when your VMs are configured with Clevis/Tang for network-bound decryption. This setting applies to all VMs in the plan.',
              )}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        name={OtherSettingsFormFieldId.NBDEClevis}
        control={control}
        render={({ field }) => (
          <Checkbox
            id="nbde-clevis-checkbox"
            isChecked={field.value || false}
            onChange={(_event, checked) => {
              field.onChange(checked);
            }}
            label={t('Use NBDE/Clevis')}
          />
        )}
      />
    </FormGroup>
  );
};

export default NBDEClevisField;

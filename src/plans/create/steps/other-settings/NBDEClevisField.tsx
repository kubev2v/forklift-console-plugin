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
      labelHelp={
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
        control={control}
        name={OtherSettingsFormFieldId.NBDEClevis}
        render={({ field }) => (
          <Checkbox
            data-testid="use-nbde-clevis-checkbox"
            id="nbde-clevis-checkbox"
            isChecked={field.value || false}
            label={t('Use NBDE/Clevis')}
            onChange={(_event, checked) => {
              field.onChange(checked);
            }}
          />
        )}
      />
    </FormGroup>
  );
};

export default NBDEClevisField;

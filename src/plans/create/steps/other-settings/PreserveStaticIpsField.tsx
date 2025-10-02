import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import {
  Alert,
  Checkbox,
  FormGroup,
  FormHelperText,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { NetworkMapFieldId } from '../network-map/constants';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';
import { isMapToPod } from './utils';

const PreserveStaticIpsField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const label = otherFormFieldLabels[OtherSettingsFormFieldId.PreserveStaticIps];
  const [preserveStaticIps, networkMap] = useWatch({
    control,
    name: [OtherSettingsFormFieldId.PreserveStaticIps, NetworkMapFieldId.NetworkMap],
  });

  return (
    <FormGroup
      fieldId={OtherSettingsFormFieldId.PreserveStaticIps}
      label={label}
      labelIcon={
        <HelpIconPopover header={label}>
          {t(
            'By default, vNICs change during migration and static IPs linked to interface names are lost. Enable to preserve static IP configurations.',
          )}
        </HelpIconPopover>
      }
      className="checkbox-form-group"
    >
      <Stack hasGutter>
        <FormHelperText>
          {t('Use when VMs have static IPs that must remain unchanged after migration.')}
        </FormHelperText>

        <Controller
          name={OtherSettingsFormFieldId.PreserveStaticIps}
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Checkbox
              id={OtherSettingsFormFieldId.PreserveStaticIps}
              label={label}
              isChecked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {preserveStaticIps && isMapToPod(networkMap) && (
          <Alert
            isInline
            variant="warning"
            title={t(
              'Preserving the static IPs might not work as expected - go back and choose a different mapping for your migration plan',
            )}
            className="pf-v5-u-ml-lg"
          >
            <ForkliftTrans>
              <Stack hasGutter>
                <StackItem>
                  Your migration plan is set to <strong>preserve static IPs </strong> of VMs and to
                  use <strong>Default Network</strong> for target network mapping. This combination
                  isn't supported, because VM IPs aren't preserved in Default Network migrations.
                </StackItem>
                <StackItem>
                  If your VMs use static IPs, go back to <strong>Network map</strong> step, and
                  choose a different target network mapping.
                </StackItem>
                <StackItem>
                  If your VMs do not use static IPs, you can ignore this message.
                </StackItem>
              </Stack>
            </ForkliftTrans>
          </Alert>
        )}
      </Stack>
    </FormGroup>
  );
};

export default PreserveStaticIpsField;

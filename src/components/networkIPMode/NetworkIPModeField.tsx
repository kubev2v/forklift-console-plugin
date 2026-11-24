import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import Select from '@components/common/Select';
import { useForkliftTranslation } from '@utils/i18n';
import { isDefaultNetworkTarget } from '@utils/mappings/constants';

import {
  getNetworkIPModeOptions,
  isNetworkIPModeEditableForTargetName,
  NETWORK_IP_MODE_INHERIT,
} from './networkIPModeUtils';

type NetworkIPModeFieldProps = {
  fieldId: string;
  isDisabled?: boolean;
  targetNetworkFieldId: string;
};

const NetworkIPModeField: FC<NetworkIPModeFieldProps> = ({
  fieldId,
  isDisabled,
  targetNetworkFieldId,
}) => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();
  const targetValue = useWatch({ control, name: targetNetworkFieldId }) as
    { id?: string; name?: string } | undefined;
  const options = getNetworkIPModeOptions(t);
  const isEditable = isNetworkIPModeEditableForTargetName(targetValue, isDefaultNetworkTarget);

  if (!isEditable) {
    return null;
  }

  return (
    <Controller
      control={control}
      name={fieldId}
      render={({ field }) => (
        <Select
          id={fieldId}
          isDisabled={isDisabled}
          onSelect={(_event, value) => {
            if (typeof value === 'string') {
              field.onChange(value === NETWORK_IP_MODE_INHERIT ? null : value);
            }
          }}
          options={options}
          testId={fieldId}
          value={(field.value as string | undefined) ?? NETWORK_IP_MODE_INHERIT}
        />
      )}
    />
  );
};

export default NetworkIPModeField;

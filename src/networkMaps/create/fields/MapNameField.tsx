import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { validateMapName } from '@utils/validation/mapNameValidation';

import { NetworkMapFieldId, networkMapFieldLabels } from '../../constants';
import type { CreateNetworkMapFormData } from '../types';

const MapNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    getFieldState,
  } = useFormContext<CreateNetworkMapFormData>();
  const { error } = getFieldState(NetworkMapFieldId.MapName);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.MapName}
      label={networkMapFieldLabels[NetworkMapFieldId.MapName]}
    >
      <Controller
        name={NetworkMapFieldId.MapName}
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            id={NetworkMapFieldId.MapName}
            data-testid="network-map-name-input"
            isDisabled={isSubmitting}
            validated={getInputValidated(Boolean(error))}
          />
        )}
        rules={{
          validate: (value) => validateMapName(value, t('Network map')),
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default MapNameField;

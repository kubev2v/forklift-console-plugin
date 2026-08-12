import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { TextInput } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { validateMapName } from '@utils/validation/mapNameValidation';

import { networkMapFieldLabels } from '../../utils/constants';
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
      fieldId={NetworkMapFieldId.MapName}
      isRequired
      label={networkMapFieldLabels[NetworkMapFieldId.MapName]}
    >
      <Controller
        control={control}
        name={NetworkMapFieldId.MapName}
        render={({ field }) => (
          <TextInput
            {...field}
            data-testid="network-map-name-input"
            id={NetworkMapFieldId.MapName}
            isDisabled={isSubmitting}
            validated={getInputValidated(error)}
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

import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import LUKSSecretSelect from '@components/LUKSSecretSelect/LUKSSecretSelect';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { DiskDecryptionType, otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const ExistingLUKSSecretField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getValues } = useCreatePlanFormContext();
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      fieldId={OtherSettingsFormFieldId.ExistingLUKSSecret}
      label={otherFormFieldLabels[OtherSettingsFormFieldId.ExistingLUKSSecret]}
      className="pf-v6-u-ml-lg"
      isRequired
    >
      <Controller
        name={OtherSettingsFormFieldId.ExistingLUKSSecret}
        control={control}
        rules={{
          deps: [OtherSettingsFormFieldId.DiskDecryptionType],
          validate: (value): string | true => {
            const decryptionType = getValues(OtherSettingsFormFieldId.DiskDecryptionType);

            if (decryptionType === DiskDecryptionType.Existing && !value) {
              return t('A secret must be selected.');
            }

            return true;
          },
        }}
        render={({ field }) => (
          <LUKSSecretSelect
            testId="luks-secret-select"
            id={OtherSettingsFormFieldId.ExistingLUKSSecret}
            value={field.value?.metadata?.name ?? ''}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            namespace={planProject}
          />
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingLUKSSecretField;

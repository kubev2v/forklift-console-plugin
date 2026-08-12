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
      className="pf-v6-u-ml-lg"
      fieldId={OtherSettingsFormFieldId.ExistingLUKSSecret}
      isRequired
      label={otherFormFieldLabels[OtherSettingsFormFieldId.ExistingLUKSSecret]}
    >
      <Controller
        control={control}
        name={OtherSettingsFormFieldId.ExistingLUKSSecret}
        render={({ field }) => (
          <LUKSSecretSelect
            id={OtherSettingsFormFieldId.ExistingLUKSSecret}
            namespace={planProject}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            testId="luks-secret-select"
            value={field.value?.metadata?.name ?? ''}
          />
        )}
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
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingLUKSSecretField;

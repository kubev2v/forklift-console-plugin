import type { FC, FormEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Checkbox, FormGroup } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateProviderFormData } from '../../types';
import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const Ec2CrossAccountCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, setValue, unregister } = useFormContext<CreateProviderFormData>();

  const useCrossAccount = useWatch({
    control,
    name: ProviderFormFieldId.Ec2UseCrossAccountCredentials,
  });

  const handleCheckboxChange = (_event: FormEvent<HTMLInputElement>, checked: boolean): void => {
    setValue(ProviderFormFieldId.Ec2UseCrossAccountCredentials, checked);
    if (!checked) {
      unregister([
        ProviderFormFieldId.Ec2TargetAccessKeyId,
        ProviderFormFieldId.Ec2TargetSecretAccessKey,
      ]);
    }
  };

  return (
    <>
      <FormGroup fieldId={ProviderFormFieldId.Ec2UseCrossAccountCredentials}>
        <Checkbox
          id={ProviderFormFieldId.Ec2UseCrossAccountCredentials}
          label={t('Use cross-account credentials')}
          isChecked={useCrossAccount ?? false}
          onChange={handleCheckboxChange}
          description={t(
            'Enable this if the target AWS account is different from the source account',
          )}
          data-testid="ec2-cross-account-credentials-checkbox"
        />
      </FormGroup>

      {useCrossAccount && (
        <div className="pf-v6-u-ml-lg">
          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.Ec2TargetAccessKeyId}
            fieldRules={{
              required: t('Target access key ID is required when using cross-account credentials'),
            }}
            label={t('Target access key ID')}
            helperText={t('AWS access key ID for the target account')}
            testId="ec2-target-access-key-id-input"
          />

          <ProviderFormPasswordInput
            fieldId={ProviderFormFieldId.Ec2TargetSecretAccessKey}
            fieldRules={{
              required: t(
                'Target secret access key is required when using cross-account credentials',
              ),
            }}
            label={t('Target secret access key')}
            helperText={t('AWS secret access key for the target account')}
            testId="ec2-target-secret-access-key-input"
          />
        </div>
      )}
    </>
  );
};

export default Ec2CrossAccountCredentialsFields;

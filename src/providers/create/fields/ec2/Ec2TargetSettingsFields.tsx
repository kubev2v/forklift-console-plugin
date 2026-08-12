import type { FC, FormEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Checkbox, FormGroup } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateProviderFormData } from '../../types';
import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const Ec2TargetSettingsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { clearErrors, control, setValue } = useFormContext<CreateProviderFormData>();

  const autoTargetCredentials = useWatch({
    control,
    name: ProviderFormFieldId.Ec2AutoTargetCredentials,
  });

  const handleAutoTargetChange = (_event: FormEvent<HTMLInputElement>, checked: boolean): void => {
    setValue(ProviderFormFieldId.Ec2AutoTargetCredentials, checked);
    if (checked) {
      setValue(ProviderFormFieldId.Ec2TargetAz, '');
      setValue(ProviderFormFieldId.Ec2TargetRegion, '');
      clearErrors([ProviderFormFieldId.Ec2TargetAz, ProviderFormFieldId.Ec2TargetRegion]);
    }
  };

  return (
    <>
      <FormGroup fieldId={ProviderFormFieldId.Ec2AutoTargetCredentials}>
        <Checkbox
          data-testid="ec2-auto-target-credentials-checkbox"
          description={t(
            'Automatically fetch target AWS credentials from the cluster and detect the target availability zone from worker nodes',
          )}
          id={ProviderFormFieldId.Ec2AutoTargetCredentials}
          isChecked={autoTargetCredentials ?? false}
          label={t('Auto-detect target settings')}
          onChange={handleAutoTargetChange}
        />
      </FormGroup>

      {!autoTargetCredentials && (
        <div className="pf-v6-u-ml-lg">
          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.Ec2TargetAz}
            helperText={t('Target availability zone for migrations. EBS volumes are AZ-specific.')}
            label={t('Target availability zone')}
            testId="ec2-target-az-input"
          />

          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.Ec2TargetRegion}
            helperText={t(
              'Target region for migrations. Defaults to the provider region if not specified.',
            )}
            isRequired={false}
            label={t('Target region')}
            testId="ec2-target-region-input"
          />
        </div>
      )}
    </>
  );
};

export default Ec2TargetSettingsFields;

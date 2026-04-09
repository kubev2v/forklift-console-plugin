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
          id={ProviderFormFieldId.Ec2AutoTargetCredentials}
          label={t('Auto-detect target settings')}
          isChecked={autoTargetCredentials ?? false}
          onChange={handleAutoTargetChange}
          description={t(
            'Automatically fetch target AWS credentials from the cluster and detect the target availability zone from worker nodes',
          )}
          data-testid="ec2-auto-target-credentials-checkbox"
        />
      </FormGroup>

      {!autoTargetCredentials && (
        <div className="pf-v6-u-ml-lg">
          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.Ec2TargetAz}
            isRequired={false}
            label={t('Target availability zone')}
            helperText={t('Target availability zone for migrations. EBS volumes are AZ-specific.')}
            testId="ec2-target-az-input"
          />

          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.Ec2TargetRegion}
            isRequired={false}
            label={t('Target region')}
            helperText={t(
              'Target region for migrations. Defaults to the provider region if not specified.',
            )}
            testId="ec2-target-region-input"
          />
        </div>
      )}
    </>
  );
};

export default Ec2TargetSettingsFields;

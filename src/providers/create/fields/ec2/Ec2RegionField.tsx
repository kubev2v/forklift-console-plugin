import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const Ec2RegionField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      fieldId={ProviderFormFieldId.Ec2Region}
      fieldRules={{ required: t('AWS region is required') }}
      label={t('AWS region')}
      helperText={t('The AWS region where EC2 instances are located, for example: us-east-1')}
      testId="ec2-region-input"
    />
  );
};

export default Ec2RegionField;

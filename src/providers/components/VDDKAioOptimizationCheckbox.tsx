import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { Checkbox } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../create/fields/constants';
import { useCreateProviderFormContext } from '../create/hooks/useCreateProviderFormContext';

const VDDKAioOptimizationCheckbox: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useCreateProviderFormContext();

  const { field } = useController({
    control,
    name: ProviderFormFieldId.VsphereUseVddkAioOptimization,
  });
  const isChecked = Boolean(field.value);

  return (
    <Checkbox
      className="pf-v6-u-mt-xs"
      data-testid="vddk-aio-optimization-checkbox"
      id={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      isChecked={isChecked}
      label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
      name={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      onChange={field.onChange}
    />
  );
};

export default VDDKAioOptimizationCheckbox;

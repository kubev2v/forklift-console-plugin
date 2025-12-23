import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Checkbox } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../create/fields/constants';

const VDDKAioOptimizationCheckbox: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext();

  const {
    field: { onChange, value },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereUseVddkAioOptimization,
  });

  return (
    <Checkbox
      label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
      isChecked={value}
      onChange={onChange}
      id={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      name={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      data-testid="vddk-aio-optimization-checkbox"
      className="pf-v6-u-mt-xs"
    />
  );
};

export default VDDKAioOptimizationCheckbox;

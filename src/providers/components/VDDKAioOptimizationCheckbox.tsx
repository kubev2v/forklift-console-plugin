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
      className="pf-v6-u-mt-xs"
      data-testid="vddk-aio-optimization-checkbox"
      id={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      isChecked={value}
      label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
      name={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      onChange={onChange}
    />
  );
};

export default VDDKAioOptimizationCheckbox;

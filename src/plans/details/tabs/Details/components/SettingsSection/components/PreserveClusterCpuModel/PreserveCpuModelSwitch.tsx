import type { FC, FormEvent } from 'react';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type PreserveCpuModelSwitchProps = {
  value: boolean;
  onChange: (checked: boolean) => void;
};

const PreserveCpuModelSwitch: FC<PreserveCpuModelSwitchProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked);
  };

  return (
    <Switch
      id="preserve-cluster-cpu-switch"
      label={t('Preserve the CPU model and flags the VM runs with in its oVirt cluster.')}
      isChecked={value}
      onChange={handleChange}
    />
  );
};

export default PreserveCpuModelSwitch;

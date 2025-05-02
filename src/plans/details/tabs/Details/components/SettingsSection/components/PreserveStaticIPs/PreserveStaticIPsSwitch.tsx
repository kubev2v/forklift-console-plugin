import type { FC, FormEvent } from 'react';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type PreserveStaticIPsSwitchProps = {
  value: boolean;
  onChange: (checked: boolean) => void;
};

const PreserveStaticIPsSwitch: FC<PreserveStaticIPsSwitchProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked);
  };

  return (
    <Switch
      id="preserve-static-ip-switch"
      label={t('Preserve the static IPs of the virtual machines migrated')}
      isChecked={value}
      hasCheckIcon
      onChange={handleChange}
    />
  );
};

export default PreserveStaticIPsSwitch;

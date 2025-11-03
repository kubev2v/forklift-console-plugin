import type { FC } from 'react';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type WarmSwitchProps = {
  onChange: (checked: boolean) => void;
  value: boolean;
};

const WarmSwitch: FC<WarmSwitchProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();
  return (
    <Switch
      label={t(
        'Warm migration, most of the data is copied during the precopy stage while the source virtual machines (VMs) are running.',
      )}
      isChecked={value}
      onChange={(_, checked) => {
        onChange(checked);
      }}
    />
  );
};

export default WarmSwitch;

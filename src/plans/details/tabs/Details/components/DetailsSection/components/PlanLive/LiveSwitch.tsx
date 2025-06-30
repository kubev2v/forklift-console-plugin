import type { FC } from 'react';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type LiveSwitchProps = {
  onChange: (checked: boolean) => void;
  value: boolean;
};

const LiveSwitch: FC<LiveSwitchProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();
  return (
    <Switch
      label={t(
        'Live migration, the source virtual machines continue running while their state is synchronized with the destination.',
      )}
      labelOff={t(
        'Cold migration, the source virtual machines are shut down while the data is copied.',
      )}
      isChecked={value}
      onChange={(_, checked) => {
        onChange(checked);
      }}
    />
  );
};

export default LiveSwitch;

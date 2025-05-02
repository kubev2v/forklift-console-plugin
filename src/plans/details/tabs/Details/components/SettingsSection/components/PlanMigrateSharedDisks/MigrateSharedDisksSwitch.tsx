import type { FC, FormEvent } from 'react';

import { Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type MigrateSharedDisksSwitchProps = {
  value: boolean;
  onChange: (checked: boolean) => void;
};

const MigrateSharedDisksSwitch: FC<MigrateSharedDisksSwitchProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  const handleChange = (_event: FormEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked);
  };

  return (
    <Switch
      id="migrate-shared-disks-switch"
      label={t('Migrate shared disks. This may slow down the migration process')}
      isChecked={value}
      hasCheckIcon
      onChange={handleChange}
    />
  );
};

export default MigrateSharedDisksSwitch;

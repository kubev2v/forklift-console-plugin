import React, { type FC } from 'react';
import type { ModalInputComponentType } from 'src/modules/Providers/modals';

import { Switch } from '@patternfly/react-core';
import { safeBoolean } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type SwitchRendererProps = {
  value: string;
  onChange: (string: string) => void;
};

const MigrateSharedDisksSwitchFactory: () => ModalInputComponentType = () => {
  const { t } = useForkliftTranslation();

  const SwitchRenderer: FC<SwitchRendererProps> = ({ onChange, value }) => (
    <Switch
      id="migrate-shared-disks-switch"
      label={t('Migrate shared disks. This may slow down the migration process')}
      isChecked={safeBoolean(value)}
      hasCheckIcon
      onChange={(_event, checked) => {
        onChange(checked.toString());
      }}
    />
  );

  return SwitchRenderer;
};

export default MigrateSharedDisksSwitchFactory;

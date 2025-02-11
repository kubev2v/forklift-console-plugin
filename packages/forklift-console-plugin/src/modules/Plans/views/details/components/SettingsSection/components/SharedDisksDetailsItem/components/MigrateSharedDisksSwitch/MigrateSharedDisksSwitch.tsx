import React, { FC } from 'react';
import { ModalInputComponentType } from 'src/modules/Providers/modals';
import { safeBoolean } from 'src/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Switch } from '@patternfly/react-core';

type SwitchRendererProps = {
  value: string;
  onChange: (string: string) => void;
};

const MigrateSharedDisksSwitchFactory: () => ModalInputComponentType = () => {
  const { t } = useForkliftTranslation();

  const SwitchRenderer: FC<SwitchRendererProps> = ({ value, onChange }) => (
    <Switch
      id="migrate-shared-disks-switch"
      label={t('Migrate shared disks again. This may slow down the migration process')}
      isChecked={safeBoolean(value)}
      onChange={(_event, checked) => {
        onChange(checked.toString());
      }}
    />
  );

  return SwitchRenderer;
};

export default MigrateSharedDisksSwitchFactory;

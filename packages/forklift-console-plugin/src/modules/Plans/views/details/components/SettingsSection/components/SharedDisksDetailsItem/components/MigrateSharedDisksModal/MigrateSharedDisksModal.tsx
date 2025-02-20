import React, { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';

import { SettingsEditModalProps } from '../../../../utils/types';
import { onConfirmMigrateSharedDisks } from '../../utils/helpers';
import MigrateSharedDisksSwitchFactory from '../MigrateSharedDisksSwitch/MigrateSharedDisksSwitch';

const MigrateSharedDisksModal: FC<SettingsEditModalProps> = ({ resource, jsonPath, title }) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      resource={resource}
      jsonPath={jsonPath}
      title={title}
      body={t(
        'If virtual machines are using shared disks, Migration Toolkit for Virtualization (MTV) will migrate the shared disks only one time by default.',
      )}
      model={PlanModel}
      onConfirmHook={onConfirmMigrateSharedDisks}
      InputComponent={MigrateSharedDisksSwitchFactory()}
    />
  );
};

export default MigrateSharedDisksModal;

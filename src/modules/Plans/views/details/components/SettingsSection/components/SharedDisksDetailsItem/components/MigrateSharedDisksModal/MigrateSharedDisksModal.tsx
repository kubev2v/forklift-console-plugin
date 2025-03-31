import React, { type FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals';
import { ForkliftTrans } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';

import type { SettingsEditModalProps } from '../../../../utils/types';
import { onConfirmMigrateSharedDisks } from '../../utils/helpers';
import MigrateSharedDisksSwitchFactory from '../MigrateSharedDisksSwitch/MigrateSharedDisksSwitch';

const MigrateSharedDisksModal: FC<SettingsEditModalProps> = ({ jsonPath, resource, title }) => {
  const ModalBody = (
    <ForkliftTrans>
      <p>
        MTV behavior is based on the <strong>Shared disks</strong> setting in the plan.
        <br />
        If this is set to <strong>true</strong>, the shared disks will be migrated.
        <br />
        If this is set to <strong>false</strong>, the shared disks will not be migrated.
      </p>
    </ForkliftTrans>
  );

  return (
    <EditModal
      resource={resource}
      jsonPath={jsonPath}
      title={title}
      body={ModalBody}
      model={PlanModel}
      onConfirmHook={onConfirmMigrateSharedDisks}
      InputComponent={MigrateSharedDisksSwitchFactory()}
    />
  );
};

export default MigrateSharedDisksModal;

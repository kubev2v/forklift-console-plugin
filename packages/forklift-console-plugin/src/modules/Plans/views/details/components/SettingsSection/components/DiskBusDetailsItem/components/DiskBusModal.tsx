import React, { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';

import { SettingsEditModalProps } from '../../../utils/types';
import { onConfirmDiskBus } from '../utils/utils';

import DiskBusDropdownFactory from './DiskBusDropdown';

const DiskBusModal: FC<SettingsEditModalProps> = ({ resource, jsonPath, title }) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      resource={resource}
      jsonPath={jsonPath}
      title={title}
      body={t(
        'Select the disk bus type for the virtual machines in the plan. The disk bus type determines how the virtual machines access the disks.',
      )}
      model={PlanModel}
      onConfirmHook={onConfirmDiskBus}
      InputComponent={DiskBusDropdownFactory()}
    />
  );
};

export default DiskBusModal;

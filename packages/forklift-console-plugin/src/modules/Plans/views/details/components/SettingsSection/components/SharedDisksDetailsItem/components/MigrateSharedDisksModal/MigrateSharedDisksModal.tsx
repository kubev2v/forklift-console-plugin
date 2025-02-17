import React, { FC } from 'react';
import { EditModal, EditModalProps } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Modify, PlanModel, V1beta1Plan } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { onConfirmMigrateSharedDisks } from '../../utils/helpers';
import MigrateSharedDisksSwitchFactory from '../MigrateSharedDisksSwitch/MigrateSharedDisksSwitch';

type MigrateSharedDisksModalProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

const MigrateSharedDisksModal: FC<MigrateSharedDisksModalProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      resource={resource}
      jsonPath={['spec', 'migrateSharedDisks']}
      title={t('Shared disks')}
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

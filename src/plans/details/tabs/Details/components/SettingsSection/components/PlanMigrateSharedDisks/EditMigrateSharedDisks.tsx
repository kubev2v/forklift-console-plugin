import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getMigrateSharedDisksValue, onConfirmMigrateSharedDisks } from './utils/utils';
import EditMigrateSharedDisksBody from './EditMigrateSharedDisksBody';
import MigrateSharedDisksSwitch from './MigrateSharedDisksSwitch';

const EditMigrateSharedDisks: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getMigrateSharedDisksValue(resource));

  return (
    <ModalForm
      title={t('Migrate shared disks')}
      onConfirm={async () => onConfirmMigrateSharedDisks({ newValue: value, resource })}
      {...rest}
    >
      <EditMigrateSharedDisksBody />
      <MigrateSharedDisksSwitch value={value} onChange={setValue} />
    </ModalForm>
  );
};

export default EditMigrateSharedDisks;

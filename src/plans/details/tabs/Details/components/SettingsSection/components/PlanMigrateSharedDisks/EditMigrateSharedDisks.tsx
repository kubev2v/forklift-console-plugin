import { type FC, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getMigrateSharedDisksValue, onConfirmMigrateSharedDisks } from './utils/utils';
import EditMigrateSharedDisksBody from './EditMigrateSharedDisksBody';
import MigrateSharedDisksSwitch from './MigrateSharedDisksSwitch';

const EditMigrateSharedDisks: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getMigrateSharedDisksValue(resource));

  return (
    <ModalForm
      title={t('Migrate shared disks')}
      onConfirm={async () => onConfirmMigrateSharedDisks({ newValue: value, resource })}
    >
      <EditMigrateSharedDisksBody />
      <MigrateSharedDisksSwitch value={value} onChange={setValue} />
    </ModalForm>
  );
};

export default EditMigrateSharedDisks;

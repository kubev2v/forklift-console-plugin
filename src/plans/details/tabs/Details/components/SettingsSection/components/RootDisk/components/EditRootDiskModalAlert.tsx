import type { FC } from 'react';
import { AlertMessageForModals } from 'src/providers/modals/components/AlertMessageForModals';

import type { V1beta1PlanSpecVms } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

type EditRootDiskModalAlertProps = {
  vms: V1beta1PlanSpecVms[];
};

const EditRootDiskModalAlert: FC<EditRootDiskModalAlertProps> = ({ vms }) => {
  const { t } = useForkliftTranslation();
  const rootDisk = vms?.[0]?.rootDisk;
  const allVMsMatch = vms.every((vm) => vm.rootDisk === rootDisk);
  if (allVMsMatch) return null;

  return (
    <AlertMessageForModals
      variant="warning"
      title={t('The plan rootDisk keys was manually configured')}
      message={
        <>
          <p>
            {t('Warning: not all virtual machines are configures using the same root disk number,')}
          </p>
          <p>{t('updating the root disk number will override the current configuration.')}</p>
        </>
      }
    />
  );
};

export default EditRootDiskModalAlert;

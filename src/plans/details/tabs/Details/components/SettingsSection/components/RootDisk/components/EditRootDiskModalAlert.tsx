import type { FC } from 'react';
import { AlertMessageForModals } from 'src/components/modals/AlertMessageForModals';

import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import { useForkliftTranslation } from '@utils/i18n';

type EditRootDiskModalAlertProps = {
  vms: V1beta1PlanSpecVms[];
};

const EditRootDiskModalAlert: FC<EditRootDiskModalAlertProps> = ({ vms }) => {
  const { t } = useForkliftTranslation();
  const rootDisk = vms?.[0]?.rootDisk;
  const allVMsMatch = vms.every((vm) => vm.rootDisk === rootDisk);
  if (allVMsMatch) {
    return null;
  }

  return (
    <AlertMessageForModals
      message={
        <>
          <p>
            {t('Warning: not all virtual machines are configures using the same root disk number,')}
          </p>
          <p>{t('updating the root disk number will override the current configuration.')}</p>
        </>
      }
      title={t('The plan rootDisk keys was manually configured')}
      variant="warning"
    />
  );
};

export default EditRootDiskModalAlert;

import type { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';

import type { SettingsEditModalProps } from '../../utils/types';

import { onConfirmWarm } from './utils/utils';
import WarmSwitch from './WarmSwitch';

const EditPlanWarm: FC<SettingsEditModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={(obj) => ((obj as V1beta1Plan)?.spec?.warm ? 'true' : 'false')}
      title={t('Set warm migration')}
      label={t('Whether this is a warm migration')}
      model={PlanModel}
      onConfirmHook={onConfirmWarm}
      body={t(
        `In warm migration, the VM disks are copied incrementally using changed block tracking (CBT) snapshots.
        The snapshots are created at one-hour intervals by default.
        You can change the snapshot interval by updating the forklift-controller deployment.`,
      )}
      InputComponent={WarmSwitch}
    />
  );
};

export default EditPlanWarm;

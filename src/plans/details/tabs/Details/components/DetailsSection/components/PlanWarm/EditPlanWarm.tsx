import { useState } from 'react';
import PlanVddkForWarmWarningAlert from 'src/plans/components/PlanVddkForWarmWarningAlert';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmWarm } from './utils/utils';
import WarmSwitch from './WarmSwitch';

const EditPlanWarm: ModalComponent<EditPlanProps> = ({
  isVddkInitImageNotSet,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [isWarm, setIsWarm] = useState<boolean>(Boolean(getPlanIsWarm(resource)));

  return (
    <ModalForm
      title={t('Set warm migration')}
      onConfirm={async () => onConfirmWarm({ newValue: isWarm, resource })}
      {...rest}
    >
      <Stack hasGutter>
        {t(
          `In warm migration, the VM disks are copied incrementally using changed block tracking (CBT) snapshots.
          The snapshots are created at one-hour intervals by default.
          You can change the snapshot interval by updating the forklift-controller deployment.`,
        )}
        <FormGroup label={t('Whether this is a warm migration')} />
        <WarmSwitch value={isWarm} onChange={setIsWarm} />
        {isWarm && isVddkInitImageNotSet && <PlanVddkForWarmWarningAlert />}
      </Stack>
    </ModalForm>
  );
};

export default EditPlanWarm;

import { type FC, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmWarm } from './utils/utils';
import WarmSwitch from './WarmSwitch';

const EditPlanWarm: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanIsWarm(resource)));

  return (
    <ModalForm
      title={t('Set warm migration')}
      onConfirm={async () => onConfirmWarm({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(
          `In warm migration, the VM disks are copied incrementally using changed block tracking (CBT) snapshots.
          The snapshots are created at one-hour intervals by default.
          You can change the snapshot interval by updating the forklift-controller deployment.`,
        )}
        <FormGroup label={t('Whether this is a warm migration')} />
        <WarmSwitch value={value} onChange={setValue} />
      </Stack>
    </ModalForm>
  );
};

export default EditPlanWarm;

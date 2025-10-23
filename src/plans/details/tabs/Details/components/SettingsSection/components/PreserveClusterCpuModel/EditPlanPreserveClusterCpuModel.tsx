import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getPlanPreserveClusterCpuModel } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmPreserveCpuModel } from './utils/utils';
import PreserveCpuModelSwitch from './PreserveCpuModelSwitch';

const EditPlanPreserveClusterCpuModel: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanPreserveClusterCpuModel(resource)));

  return (
    <ModalForm
      title={t('Set to preserve the CPU model')}
      onConfirm={async () => onConfirmPreserveCpuModel({ newValue: value, resource })}
      {...rest}
    >
      <Stack hasGutter>
        {t(`Preserve the CPU model and flags the VM runs with in its oVirt cluster.`)}
        <FormGroup label={t('Whether to preserve the CPU model')} />
        <PreserveCpuModelSwitch value={value} onChange={setValue} />
      </Stack>
    </ModalForm>
  );
};

export default EditPlanPreserveClusterCpuModel;

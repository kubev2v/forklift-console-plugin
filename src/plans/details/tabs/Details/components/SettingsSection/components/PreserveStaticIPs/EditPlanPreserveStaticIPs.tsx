import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { getPlanPreserveIP } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmPreserveStaticIPs } from './utils/utils';
import PreserveStaticIPsSwitch from './PreserveStaticIPsSwitch';

const EditPlanPreserveStaticIPs: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanPreserveIP(resource)));

  return (
    <ModalForm
      title={t('Set to preserve the static IPs')}
      onConfirm={async () => onConfirmPreserveStaticIPs({ newValue: value, resource })}
      {...rest}
    >
      <PreserveStaticIPsSwitch value={value} onChange={setValue} />
    </ModalForm>
  );
};

export default EditPlanPreserveStaticIPs;

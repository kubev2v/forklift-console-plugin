import { type FC, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { getPlanPreserveIP } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmPreserveStaticIPs } from './utils/utils';
import PreserveStaticIPsSwitch from './PreserveStaticIPsSwitch';

const EditPlanPreserveStaticIPs: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanPreserveIP(resource)));

  return (
    <ModalForm
      title={t('Set to preserve the static IPs')}
      onConfirm={async () => onConfirmPreserveStaticIPs({ newValue: value, resource })}
    >
      <PreserveStaticIPsSwitch value={value} onChange={setValue} />
    </ModalForm>
  );
};

export default EditPlanPreserveStaticIPs;

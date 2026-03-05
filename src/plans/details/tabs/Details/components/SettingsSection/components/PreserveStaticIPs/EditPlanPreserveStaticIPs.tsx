import { useState } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox } from '@patternfly/react-core';
import { getPlanPreserveIP } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmPreserveStaticIPs } from './utils/utils';

const EditPlanPreserveStaticIPs: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanPreserveIP(resource)));

  return (
    <ModalForm
      title={t('Edit static IPs')}
      description={t('Use when VMs have static IPs that must remain unchanged after migration.')}
      headerHelp={
        <HelpIconPopover header={t('Preserve static IPs')}>
          {t(
            'By default, vNICs change during migration and static IPs linked to interface names are lost. Enable to preserve static IP configurations.',
          )}
        </HelpIconPopover>
      }
      onConfirm={async () => onConfirmPreserveStaticIPs({ newValue: value, resource })}
      {...rest}
    >
      <Checkbox
        id="preserve-static-ips-checkbox"
        data-testid="preserve-static-ips-checkbox"
        label={t('Preserve static IPs')}
        isChecked={value}
        onChange={(_, checked) => {
          setValue(checked);
        }}
      />
    </ModalForm>
  );
};

export default EditPlanPreserveStaticIPs;

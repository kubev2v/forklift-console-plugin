import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getPlanIsLive } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmLive } from './utils/utils';
import LiveSwitch from './LiveSwitch';

const EditPlanLive: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getPlanIsLive(resource));

  return (
    <ModalForm
      title={t('Set live migration')}
      onConfirm={async () => onConfirmLive({ newValue: value, resource })}
      {...rest}
    >
      <Stack hasGutter>
        {t(
          `In live migration, the source virtual machine continues to run until the migration is complete.`,
        )}
        <FormGroup label={t('Whether this is a live migration')} />
        <LiveSwitch value={value} onChange={setValue} />
      </Stack>
    </ModalForm>
  );
};

export default EditPlanLive;

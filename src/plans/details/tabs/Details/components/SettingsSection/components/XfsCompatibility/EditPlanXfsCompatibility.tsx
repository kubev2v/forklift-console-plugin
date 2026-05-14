import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getPlanXfsCompatibility, onConfirmXfsCompatibility } from './utils/utils';

const EditPlanXfsCompatibility: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanXfsCompatibility(resource)));

  return (
    <ModalForm
      title={t('Edit XFS v4 compatibility')}
      description={t(
        'XFS v4 and BTRFS support are mutually exclusive. Enable for XFS v4 filesystems; leave disabled for BTRFS.',
      )}
      onConfirm={async () => onConfirmXfsCompatibility({ newValue: value, resource })}
      {...rest}
    >
      <Checkbox
        id="xfs-compatibility-checkbox"
        data-testid="xfs-compatibility-checkbox"
        label={t('Enable XFS v4 compatibility')}
        isChecked={value}
        onChange={(_, checked) => {
          setValue(checked);
        }}
      />
    </ModalForm>
  );
};

export default EditPlanXfsCompatibility;

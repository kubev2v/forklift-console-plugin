import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Checkbox } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getPlanXfsCompatibility, onConfirmXfsCompatibility } from './utils/utils';

const EditPlanXfsCompatibility: OverlayComponent<EditPlanProps> = ({
  closeOverlay,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanXfsCompatibility(resource)));

  return (
    <ModalForm
      closeModal={closeOverlay}
      description={t(
        'XFS v4 and BTRFS support are mutually exclusive. Enable for XFS v4 filesystems; leave disabled for BTRFS.',
      )}
      onConfirm={async () => onConfirmXfsCompatibility({ newValue: value, resource })}
      title={t('Edit XFS v4 compatibility')}
      {...rest}
    >
      <Checkbox
        data-testid="xfs-compatibility-checkbox"
        id="xfs-compatibility-checkbox"
        isChecked={value}
        label={t('Enable XFS v4 compatibility')}
        onChange={(_, checked) => {
          setValue(checked);
        }}
      />
    </ModalForm>
  );
};

export default EditPlanXfsCompatibility;

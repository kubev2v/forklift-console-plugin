import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, TextInput } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditRootDiskModalAlert from './components/EditRootDiskModalAlert';
import EditRootDiskModalBody from './components/EditRootDiskModalBody';
import { onConfirmRootDisk } from './utils/utils';

const EditRootDisk: OverlayComponent<EditPlanProps> = ({ closeOverlay, resource }) => {
  const { t } = useForkliftTranslation();

  const vms = getPlanVirtualMachines(resource);
  const rootDisk = vms?.[0]?.rootDisk ?? '';

  const [value, setValue] = useState<string>(rootDisk);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => onConfirmRootDisk(resource, value)}
      title={t('Edit root device')}
    >
      <Stack hasGutter>
        <EditRootDiskModalBody />
        <EditRootDiskModalAlert vms={vms} />
        <FormGroupWithHelpText
          helperText={t(
            'Provide the storage device or partition that contains the root filesystem. If left blank, the first root device will be used.',
          )}
          label={t('Root device')}
        >
          <TextInput
            onChange={(_event, newValue) => {
              setValue(newValue);
            }}
            value={value}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditRootDisk;

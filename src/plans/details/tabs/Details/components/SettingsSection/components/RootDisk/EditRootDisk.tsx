import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack, TextInput } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditRootDiskModalAlert from './components/EditRootDiskModalAlert';
import EditRootDiskModalBody from './components/EditRootDiskModalBody';
import { onConfirmRootDisk } from './utils/utils';

const EditRootDisk: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();

  const vms = getPlanVirtualMachines(resource);
  const rootDisk = vms?.[0]?.rootDisk ?? '';

  const [value, setValue] = useState<string>(rootDisk);

  return (
    <ModalForm
      title={t('Edit root device')}
      onConfirm={async () => onConfirmRootDisk(resource, value)}
      {...rest}
    >
      <Stack hasGutter>
        <EditRootDiskModalBody />
        <EditRootDiskModalAlert vms={vms} />
        <FormGroupWithHelpText
          label={t('Root device')}
          helperText={t(
            'Provide the storage device or partition that contains the root filesystem. If left blank, the first root device will be used.',
          )}
        >
          <TextInput
            value={value}
            onChange={(_event, newValue) => {
              setValue(newValue);
            }}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditRootDisk;

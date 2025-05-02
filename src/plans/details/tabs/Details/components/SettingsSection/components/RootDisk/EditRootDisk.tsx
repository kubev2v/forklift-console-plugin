import { type FC, useMemo, useState } from 'react';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditRootDiskModalAlert from './components/EditRootDiskModalAlert';
import EditRootDiskModalBody from './components/EditRootDiskModalBody';
import { getDiskOptionItems } from './utils/getDiskOptionItems';
import { onConfirmRootDisk } from './utils/utils';

const EditRootDisk: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();

  const vms = getPlanVirtualMachines(resource);
  const rootDisk = vms?.[0]?.rootDisk ?? '';

  const [value, setValue] = useState<string>(rootDisk);

  const dropdownItems = useMemo(() => getDiskOptionItems(), []);

  return (
    <ModalForm
      title={t('Edit root device')}
      onConfirm={async () => onConfirmRootDisk(resource, value)}
    >
      <Stack hasGutter>
        <EditRootDiskModalBody />
        <EditRootDiskModalAlert vms={vms} />
        <FormGroup label={t('Root device')}>
          <FilterableSelect
            selectOptions={dropdownItems}
            value={value}
            onSelect={(newValue) => {
              setValue(newValue as string);
            }}
            canCreate
            placeholder={t('First root device')}
            createNewOptionLabel={t('Custom path:')}
          />
        </FormGroup>
      </Stack>
    </ModalForm>
  );
};

export default EditRootDisk;

import type { FC } from 'react';
import { getVmCutover } from 'src/plans/components/CutoverModal/utils/utils';

import type { V1beta1Migration } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';

import type { VmModalProps } from '../../VmCutover/VmCutoverMigrationModal';
import VmCutoverMigrationModal from '../../VmCutover/VmCutoverMigrationModal';

import { getChangeCutoverText, getEditCutoverDescription } from './utils/utils';

type VMMigrationActionsDropdownItemsProps = {
  isInStorePowerState: boolean;
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VMMigrationActionsDropdownItems: FC<VMMigrationActionsDropdownItemsProps> = ({
  isInStorePowerState,
  migration,
  vmId,
  vmName,
}) => {
  const launchOverlay = useOverlay();

  const hasCutover = Boolean(getVmCutover(migration, vmId));

  return (
    <DropdownList>
      <DropdownItem
        data-testid="edit-vm-cutover-item"
        description={isInStorePowerState ? getEditCutoverDescription() : undefined}
        isDisabled={isInStorePowerState}
        key="edit-vm-cutover"
        onClick={() => {
          launchOverlay<VmModalProps>(VmCutoverMigrationModal, {
            migration,
            vmId,
            vmName,
          });
        }}
      >
        {getChangeCutoverText(hasCutover)}
      </DropdownItem>
    </DropdownList>
  );
};

export default VMMigrationActionsDropdownItems;

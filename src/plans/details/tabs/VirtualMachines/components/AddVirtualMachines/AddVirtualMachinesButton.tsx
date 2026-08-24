import { type FC, useMemo } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { AddVirtualMachineProps } from './utils/types';
import AddVirtualMachinesModal from './AddVirtualMachinesModal';

const AddVirtualMachinesButton: FC<AddVirtualMachineProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const onClick = (): void => {
    launchOverlay<AddVirtualMachineProps>(AddVirtualMachinesModal, { plan });
  };

  const reason = useMemo((): string | null => {
    if (!isPlanEditable(plan)) {
      return t('The migration plan is not editable.');
    }
    return null;
  }, [plan, t]);

  return (
    <ToolbarItem>
      <VMsActionButton disabledReason={reason} onClick={onClick}>
        {t('Add VMs')}
      </VMsActionButton>
    </ToolbarItem>
  );
};

export default AddVirtualMachinesButton;

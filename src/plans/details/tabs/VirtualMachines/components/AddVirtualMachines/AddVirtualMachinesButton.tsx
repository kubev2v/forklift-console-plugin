import { type FC, useMemo } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { AddVirtualMachineProps } from './utils/types';
import AddVirtualMachinesModal from './AddVirtualMachinesModal';

const AddVirtualMachinesButton: FC<AddVirtualMachineProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const onClick = (): void => {
    launcher<AddVirtualMachineProps>(AddVirtualMachinesModal, { plan });
  };

  const reason = useMemo((): string | null => {
    if (!isPlanEditable(plan)) {
      return t('The migration plan is not editable.');
    }
    return null;
  }, [plan, t]);

  return (
    <ToolbarItem>
      <VMsActionButton onClick={onClick} disabledReason={reason}>
        {t('Add virtual machines')}
      </VMsActionButton>
    </ToolbarItem>
  );
};

export default AddVirtualMachinesButton;

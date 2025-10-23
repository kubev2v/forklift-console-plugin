import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { CancelMigrationVirtualMachinesProps } from './utils/types';
import CancelMigrationVirtualMachinesModal from './CancelMigrationVirtualMachinesModal';

const CancelMigrationVirtualMachinesButton: FC<CancelMigrationVirtualMachinesProps> = ({
  migration,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const onClick = () => {
    launcher<CancelMigrationVirtualMachinesProps>(CancelMigrationVirtualMachinesModal, {
      migration,
      selectedIds,
    });
  };

  const reason = selectedIds?.length < 1 ? t('Select at least one virtual machine.') : null;

  return (
    <ToolbarItem>
      <VMsActionButton onClick={onClick} disabledReason={reason}>
        {t('Cancel virtual machines')}
      </VMsActionButton>
    </ToolbarItem>
  );
};

export default CancelMigrationVirtualMachinesButton;

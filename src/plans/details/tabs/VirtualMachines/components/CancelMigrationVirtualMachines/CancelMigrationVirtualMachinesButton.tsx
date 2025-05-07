import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { CancelMigrationVirtualMachinesProps } from './utils/types';
import CancelMigrationVirtualMachinesModal from './CancelMigrationVirtualMachinesModal';

const CancelMigrationVirtualMachinesButton: FC<CancelMigrationVirtualMachinesProps> = ({
  migration,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const onClick = () => {
    showModal(
      <CancelMigrationVirtualMachinesModal migration={migration} selectedIds={selectedIds} />,
    );
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

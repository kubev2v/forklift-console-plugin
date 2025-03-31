import React, { type FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Migration } from '@kubev2v/types';
import { ToolbarItem } from '@patternfly/react-core';

import { MigrationVMsCancelModal } from '../modals';

import { VMsActionButton } from './VMsActionButton';

export const MigrationVMsCancelButton: FC<{
  selectedIds: string[];
  migration: V1beta1Migration;
}> = ({ migration, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const onClick = () => {
    showModal(<MigrationVMsCancelModal migration={migration} selected={selectedIds} />);
  };

  const reason = selectedIds?.length < 1 && t('Select at least one virtual machine.');

  return (
    <ToolbarItem>
      <VMsActionButton onClick={onClick} disabledReason={reason}>
        {t('Cancel virtual machines')}
      </VMsActionButton>
    </ToolbarItem>
  );
};

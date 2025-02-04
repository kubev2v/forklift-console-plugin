import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Migration } from '@kubev2v/types';
import { Button, ToolbarItem, Tooltip } from '@patternfly/react-core';

import { MigrationVMsCancelModal } from '../modals';

export const MigrationVMsCancelButton: FC<{
  selectedIds: string[];
  migration: V1beta1Migration;
}> = ({ selectedIds, migration }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const onClick = () => {
    showModal(<MigrationVMsCancelModal migration={migration} selected={selectedIds} />);
  };

  const reason = selectedIds?.length < 1 && t('Select at least one virtual machine.');

  const button = (
    <Button variant="secondary" onClick={onClick} isAriaDisabled={Boolean(reason)}>
      {t('Cancel virtual machines')}
    </Button>
  );

  return (
    <ToolbarItem>{reason ? <Tooltip content={reason}>{button}</Tooltip> : button}</ToolbarItem>
  );
};

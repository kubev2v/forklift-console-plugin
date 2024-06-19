import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Migration } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

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

  return (
    <ToolbarItem>
      <Button variant="secondary" onClick={onClick} isDisabled={!selectedIds?.length}>
        {t('Cancel virtual machines')}
      </Button>
    </ToolbarItem>
  );
};

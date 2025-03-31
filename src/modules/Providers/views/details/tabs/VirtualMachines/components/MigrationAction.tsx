import React, { type FC } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1Provider } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

import type { VmData } from './VMCellProps';

export const MigrationAction: FC<{
  selectedVms: VmData[];
  provider: V1beta1Provider;
  className?: string;
}> = ({ className, provider, selectedVms }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const planListURL = getResourceUrl({
    namespaced: false,
    reference: PlanModelRef,
  });
  const { setData } = useCreateVmMigrationData();

  const onClick = () => {
    setData({ projectName: provider?.metadata?.namespace, provider, selectedVms });
    history.push(`${planListURL}/~new`);
  };

  return (
    <ToolbarItem className={className}>
      <Button variant="primary" onClick={onClick} isDisabled={!selectedVms?.length}>
        {t('Create migration plan')}
      </Button>
    </ToolbarItem>
  );
};

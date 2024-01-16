import React, { FC } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, V1beta1Provider } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

import { VmData } from './VMCellProps';

export const MigrationAction: FC<{
  selectedVms: VmData[];
  provider: V1beta1Provider;
}> = ({ selectedVms, provider }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const namespace = provider?.metadata?.namespace;
  const planListURL = getResourceUrl({
    reference: PlanModelRef,
    namespace,
    namespaced: namespace !== undefined,
  });
  const { setData } = useCreateVmMigrationData();
  return (
    <ToolbarItem>
      <Button
        variant="secondary"
        onClick={() => {
          setData({ selectedVms, provider });
          history.push(`${planListURL}/~new`);
        }}
        isDisabled={!selectedVms?.length}
      >
        {t('Migrate')}
      </Button>
    </ToolbarItem>
  );
};

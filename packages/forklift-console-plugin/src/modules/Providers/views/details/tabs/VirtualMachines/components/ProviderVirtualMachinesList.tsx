import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import StandardPage from 'src/components/page/StandardPage';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  EnumFilter,
  loadUserSettings,
  ResourceFieldFactory,
  RowProps,
  ValueMatcher,
} from '@kubev2v/common';
import { Concern } from '@kubev2v/types';

import { useInventoryVms } from '../utils/useInventoryVms';

import { VmData } from './VMCellProps';

export interface ProviderVirtualMachinesListProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  rowMapper: React.FunctionComponent<RowProps<VmData>>;
  fieldsMetadataFactory: ResourceFieldFactory;
  pageId: string;
}

export const ProviderVirtualMachinesList: React.FC<ProviderVirtualMachinesListProps> = ({
  obj,
  loaded,
  loadError,
  rowMapper,
  fieldsMetadataFactory,
  pageId,
}) => {
  const { t } = useForkliftTranslation();

  const [userSettings] = useState(() => loadUserSettings({ pageId }));

  const [vmData, loading] = useInventoryVms(obj, loaded, loadError);

  return (
    <StandardPage<VmData>
      data-testid="vm-list"
      dataSource={[vmData || [], !loading, null]}
      RowMapper={rowMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={obj?.provider?.metadata?.namespace}
      title={t('Virtual Machines')}
      userSettings={userSettings}
      extraSupportedFilters={{
        concerns: EnumFilter,
      }}
      extraSupportedMatchers={[concernsMatcher]}
    />
  );
};

const concernsMatcher: ValueMatcher = {
  filterType: 'concerns',
  matchValue: (concerns: Concern[]) => (filter: string) =>
    Array.isArray(concerns) && concerns.some(({ category }) => category === filter),
};

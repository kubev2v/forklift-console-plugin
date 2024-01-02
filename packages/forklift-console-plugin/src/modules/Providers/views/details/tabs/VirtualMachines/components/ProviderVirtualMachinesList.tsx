import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import StandardPage from 'src/components/page/StandardPage';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  EnumFilter,
  loadUserSettings,
  ResourceFieldFactory,
  RowProps,
  SearchableGroupedEnumFilter,
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
  cellMapper: FC<RowProps<VmData>>;
  fieldsMetadataFactory: ResourceFieldFactory;
  pageId: string;
}

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  obj,
  loaded,
  loadError,
  cellMapper,
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
      CellMapper={cellMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={obj?.provider?.metadata?.namespace}
      title={t('Virtual Machines')}
      userSettings={userSettings}
      extraSupportedFilters={{
        concerns: SearchableGroupedEnumFilter,
        features: EnumFilter,
      }}
      extraSupportedMatchers={[concernsMatcher, featuresMatcher]}
    />
  );
};

const concernsMatcher: ValueMatcher = {
  filterType: 'concerns',
  matchValue: (concerns: Concern[]) => (filter: string) =>
    Array.isArray(concerns) &&
    concerns.some(({ category, label }) => category === filter || label === filter),
};

const featuresMatcher: ValueMatcher = {
  filterType: 'features',
  matchValue: (features: { [key: string]: boolean }) => (filter: string) => !!features?.[filter],
};

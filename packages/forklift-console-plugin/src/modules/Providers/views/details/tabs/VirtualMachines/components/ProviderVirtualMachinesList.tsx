import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
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

import { MigrationAction } from './MigrationAction';
import { VmData } from './VMCellProps';

export interface ProviderVirtualMachinesListProps extends RouteComponentProps {
  title?: string;
  obj: ProviderData;
  ns?: string;
  loaded?: boolean;
  loadError?: unknown;
  cellMapper: FC<RowProps<VmData>>;
  fieldsMetadataFactory: ResourceFieldFactory;
  pageId: string;
  onSelect?: (selectedVMs: VmData[]) => void;
  initialSelectedIds?: string[];
  className?: string;
}

export const toId = (item: VmData) => item.vm.id;

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  title,
  obj,
  loaded,
  loadError,
  cellMapper,
  fieldsMetadataFactory,
  pageId,
  onSelect,
  initialSelectedIds,
  className,
}) => {
  const { t } = useForkliftTranslation();

  const initialSelectedIds_ = initialSelectedIds || [];

  const [selectedIds, setSelectedIds] = useState(initialSelectedIds_);
  const [userSettings] = useState(() => loadUserSettings({ pageId }));

  const [vmData, loading] = useInventoryVms(obj, loaded, loadError);
  const actions: FC<GlobalActionWithSelection<VmData>>[] = [
    ({ selectedIds }) => (
      <MigrationAction
        {...{
          provider: obj?.provider,
          selectedVms: vmData.filter((data) => selectedIds.includes(toId(data))),
        }}
      />
    ),
  ];

  const onSelectedIds = (selectedIds: string[]) => {
    setSelectedIds(selectedIds);

    if (onSelect) {
      const selectedVms = vmData.filter((data) => selectedIds.includes(toId(data)));
      onSelect(selectedVms);
    }
  };

  return (
    <StandardPageWithSelection
      className={className}
      data-testid="vm-list"
      dataSource={[vmData || [], !loading, null]}
      CellMapper={cellMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={obj?.provider?.metadata?.namespace}
      title={title ?? t('Virtual Machines')}
      userSettings={userSettings}
      extraSupportedFilters={{
        concerns: SearchableGroupedEnumFilter,
        features: EnumFilter,
      }}
      extraSupportedMatchers={[concernsMatcher, featuresMatcher]}
      GlobalActionToolbarItems={actions}
      toId={toId}
      onSelect={onSelectedIds}
      selectedIds={selectedIds}
    />
  );
};

export const concernsMatcher: ValueMatcher = {
  filterType: 'concerns',
  matchValue: (concerns: Concern[]) => (filter: string) =>
    Array.isArray(concerns) &&
    concerns.some(({ category, label }) => category === filter || label === filter),
};

export const featuresMatcher: ValueMatcher = {
  filterType: 'features',
  matchValue: (features: { [key: string]: boolean }) => (filter: string) => !!features?.[filter],
};

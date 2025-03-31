import React, { type FC } from 'react';
import { EnumFilter } from 'src/components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from 'src/components/common/Filter/GroupedEnumFilter';
import type { ValueMatcher } from 'src/components/common/FilterGroup/types';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import type { RowProps } from 'src/components/common/TableView/types';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import type { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceFieldFactory } from '@components/common/utils/types';
import type { Concern } from '@kubev2v/types';

import { ConcernsTable } from './ConcernsTable';
import { MigrationAction } from './MigrationAction';
import type { VmData } from './VMCellProps';

export type ProviderVirtualMachinesListProps = {
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
  showActions: boolean;
  className?: string;
  selectedCountLabel?: (selectedIdCount: number) => string;
};

export const toId = (item: VmData) => item.vm.id;

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  cellMapper,
  className,
  fieldsMetadataFactory,
  initialSelectedIds,
  obj,
  onSelect,
  pageId,
  selectedCountLabel,
  showActions,
  title,
}) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId });

  const initialSelectedIds_ = initialSelectedIds || [];
  const initialExpandedIds_ = [];
  const { vmData, vmDataLoading } = obj;

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
    if (onSelect) {
      const selectedVms = vmData.filter((data) => selectedIds.includes(toId(data)));
      onSelect(selectedVms);
    }
  };

  return (
    <StandardPageWithSelection
      className={className}
      data-testid="vm-list"
      dataSource={[vmData || [], !vmDataLoading, null]}
      CellMapper={cellMapper}
      fieldsMetadata={fieldsMetadataFactory(t)}
      namespace={obj?.provider?.metadata?.namespace}
      title={title ?? t('Virtual Machines')}
      userSettings={userSettings}
      extraSupportedFilters={{
        concerns: GroupedEnumFilter,
        features: EnumFilter,
        host: EnumFilter,
      }}
      extraSupportedMatchers={[concernsMatcher, hostMatcher, featuresMatcher]}
      GlobalActionToolbarItems={showActions ? actions : undefined}
      toId={toId}
      onSelect={onSelectedIds}
      selectedIds={initialSelectedIds_}
      page={1}
      expandedIds={initialExpandedIds_}
      ExpandedComponent={ConcernsTable}
      selectedCountLabel={selectedCountLabel}
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
  matchValue: (features: Record<string, boolean>) => (filter: string) =>
    Boolean(features?.[filter]),
};

export const hostMatcher: ValueMatcher = {
  filterType: 'host',
  matchValue: (value: string) => (filter: string) => value == filter,
};

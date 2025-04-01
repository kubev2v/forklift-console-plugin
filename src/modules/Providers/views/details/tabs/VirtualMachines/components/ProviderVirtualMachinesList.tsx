import React, { FC } from 'react';
import { EnumFilter } from 'src/components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from 'src/components/common/Filter/GroupedEnumFilter';
import { ValueMatcher } from 'src/components/common/FilterGroup/types';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { RowProps } from 'src/components/common/TableView/types';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceFieldFactory } from '@components/common/utils/types';
import { Concern } from '@kubev2v/types';

import { ConcernsTable } from './ConcernsTable';
import { MigrationAction } from './MigrationAction';
import { VmData } from './VMCellProps';

export interface ProviderVirtualMachinesListProps {
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
}

export const toId = (item: VmData) => item.vm.id;

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  title,
  obj,
  cellMapper,
  fieldsMetadataFactory,
  pageId,
  onSelect,
  initialSelectedIds,
  showActions,
  className,
  selectedCountLabel,
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
        host: EnumFilter,
        features: EnumFilter,
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

const hostMatcher: ValueMatcher = {
  filterType: 'host',
  matchValue: (value: string) => (filter: string) => value == filter,
};

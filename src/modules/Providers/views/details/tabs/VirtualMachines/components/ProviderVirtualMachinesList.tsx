import type { FC } from 'react';
import { EnumFilter } from 'src/components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from 'src/components/common/Filter/GroupedEnumFilter';
import type { ValueMatcher } from 'src/components/common/FilterGroup/types';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import type { RowProps } from 'src/components/common/TableView/types';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';
import type { Concern } from '@kubev2v/types';

import { getVmId } from '../utils/helpers/vmProps';

import { ConcernsTable } from './ConcernsTable';
import { MigrationAction } from './MigrationAction';
import type { VmData } from './VMCellProps';

const concernsMatcher: ValueMatcher<Concern[]> = {
  filterType: 'concerns',
  matchValue: (concerns) => (filter: string) =>
    Array.isArray(concerns) &&
    concerns.some(({ category, label }) => category === filter || label === filter),
};

const featuresMatcher: ValueMatcher<Record<string, boolean>> = {
  filterType: 'features',
  matchValue: (features) => (filter: string) => Boolean(features?.[filter]),
};

const hostMatcher: ValueMatcher<string> = {
  filterType: 'host',
  matchValue: (value) => (filter: string) => value === filter,
};

type ProviderVirtualMachinesListProps = {
  title?: string;
  obj: ProviderData;
  ns?: string;
  loaded?: boolean;
  loadError?: unknown;
  cellMapper: FC<RowProps<VmData>>;
  fieldsMetadata: ResourceField[];
  pageId: string;
  onSelect?: (selectedVMs: VmData[] | undefined) => void;
  initialSelectedIds?: string[];
  showActions: boolean;
  className?: string;
};

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  cellMapper,
  className,
  fieldsMetadata,
  initialSelectedIds = [],
  obj,
  onSelect,
  pageId,
  showActions,
  title,
}) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId });

  const initialExpandedIds: string[] = [];
  const { vmData, vmDataLoading } = obj;

  const actions: FC<GlobalActionToolbarProps<VmData>>[] = [
    ({ selectedIds }) => (
      <MigrationAction
        provider={obj?.provider}
        selectedVms={
          vmData?.reduce((acc: VmData[], data) => {
            if (selectedIds?.includes(getVmId(data))) {
              acc.push(data);
            }

            return acc;
          }, []) ?? []
        }
      />
    ),
  ];

  const onSelectedIds = (selectedIds: string[]) => {
    if (onSelect) {
      const selectedVms = vmData?.filter((data) => selectedIds.includes(getVmId(data)));
      onSelect(selectedVms);
    }
  };

  return (
    <StandardPageWithSelection
      className={className}
      data-testid="vm-list"
      dataSource={[vmData ?? [], !vmDataLoading, null]}
      CellMapper={cellMapper}
      fieldsMetadata={fieldsMetadata}
      namespace={obj?.provider?.metadata?.namespace ?? ''}
      title={title ?? t('Virtual Machines')}
      userSettings={userSettings}
      extraSupportedFilters={{
        concerns: GroupedEnumFilter,
        features: EnumFilter,
        host: EnumFilter,
      }}
      extraSupportedMatchers={[concernsMatcher, hostMatcher, featuresMatcher]}
      GlobalActionToolbarItems={showActions ? actions : undefined}
      toId={getVmId}
      onSelect={onSelectedIds}
      selectedIds={initialSelectedIds}
      page={1}
      expandedIds={initialExpandedIds}
      ExpandedComponent={ConcernsTable}
    />
  );
};

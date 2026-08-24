import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import type { ProviderHost, V1beta1Provider, VSphereResource } from '@forklift-ui/types';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { useCanInspectProvider } from '@utils/hooks/useCanInspectProvider';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import { useAttributeFilters } from '../components/AttributeFilter/hooks/useAttributeFilters';
import { defaultColumns } from '../utils/constants';
import { snapPageToValidRange } from '../utils/paginationUtils';
import type { VmRow } from '../utils/types';

import usePagination from './usePagination/usePagination';
import { useTreeFilterAttributes } from './useTreeFilterAttributes';
import useTreePagination from './useTreePagination';
import { useTreeRows } from './useTreeRows';
import useTreeSortBlocks from './useTreeSortBlocks';
import useTreeFilters from './useTreeVMFilters';
import type { UseVsphereFolderTreeTableReturn } from './useVsphereFolderTreeTable.types';

type UseVsphereFolderTreeTableArgs = {
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
  initialSelectedIds: string[] | undefined;
  onSelect: ((selectedVMs: ProviderVmData[] | undefined) => void) | undefined;
  provider?: V1beta1Provider;
  providerNamespace?: string;
  providerUid?: string;
  vmData: ProviderVmData[] | undefined;
};

export const useVsphereFolderTreeTable = ({
  foldersDict,
  hostsDict,
  initialSelectedIds,
  onSelect,
  provider,
  providerNamespace,
  providerUid,
  vmData,
}: UseVsphereFolderTreeTableArgs): UseVsphereFolderTreeTableReturn => {
  const [columns, setColumns] = useState<ResourceField[]>(defaultColumns);
  const [inspectionExpandedRows, setInspectionExpandedRows] = useState<Set<string>>(new Set());

  const [conversions] = useWatchConversions({
    namespace: providerNamespace ?? '',
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        ...(providerUid ? { [CONVERSION_LABELS.PROVIDER]: providerUid } : {}),
      },
    },
  });
  const visibleVmIdsRef = useRef<Set<string> | undefined>(undefined);

  const setSelectedVmKeysControlled = useCallback(
    (ids: string[]) => {
      const idsSet = new Set(ids);
      onSelect?.(vmData?.filter(({ vm }) => idsSet.has(vm.id)));
    },
    [vmData, onSelect],
  );

  const canSelect = initialSelectedIds !== undefined;
  const { canInspect, disabledReason } = useCanInspectProvider(provider);

  const { groupVMCountByFolder, rows, selectedVmKeys, setSelectedVmKeys, setShowAll, showAll } =
    useTreeRows({
      ...(initialSelectedIds
        ? {
            controls: {
              selectedVmKeys: initialSelectedIds,
              setSelectedVmKeys: setSelectedVmKeysControlled,
            },
          }
        : undefined),
      canSelect,
      foldersDict,
      hostsDict,
      visibleVmIdsRef,
      vmDataArr: vmData,
    });

  const {
    onPerPageSelect,
    onSetPage,
    pagination: { page, perPage },
  } = usePagination();

  const attributes = useTreeFilterAttributes(rows, conversions);
  const filters = useAttributeFilters<VmRow>(attributes);

  const { filteredGroupVMCountByFolder, filteredRows, visibleVmIds } = useTreeFilters({
    filters,
    rows,
    showAll,
  });

  visibleVmIdsRef.current = filters.hasAttrFilters || !showAll ? visibleVmIds : undefined;

  const { handleOnSort, sortBy, sortedBlocks, visibleCols } = useTreeSortBlocks({
    columns,
    conversions,
    filteredRows,
  });

  const { itemCount, pagedRows } = useTreePagination({ blocks: sortedBlocks, page, perPage });

  useEffect(() => {
    snapPageToValidRange(itemCount, onSetPage, page, perPage);
  }, [itemCount, onSetPage, page, perPage]);

  return {
    attributes,
    canInspect,
    canSelect,
    columns,
    conversions,
    disabledReason,
    filteredGroupVMCountByFolder,
    filters,
    groupVMCountByFolder,
    handleOnSort,
    inspectionExpandedRows,
    itemCount,
    onPerPageSelect,
    onSetPage,
    page,
    pagedRows,
    perPage,
    provider,
    rows,
    selectedVmKeys,
    setColumns,
    setInspectionExpandedRows,
    setSelectedVmKeys,
    setShowAll,
    showAll,
    sortBy,
    sortedBlocks,
    visibleCols,
  };
};

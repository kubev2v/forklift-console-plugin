import type { Dispatch, SetStateAction } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';
import type { OnSort } from '@patternfly/react-table';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import type { AttributeFilters } from '../components/AttributeFilter/hooks/useAttributeFilters';
import type { AttributeConfig } from '../components/AttributeFilter/utils/types';
import type { Block, RowNode, VmRow } from '../utils/types';

export type UseVsphereFolderTreeTableReturn = {
  attributes: AttributeConfig<VmRow>[];
  canInspect: boolean;
  canSelect: boolean;
  columns: ResourceField[];
  conversions: V1beta1Conversion[];
  disabledReason: string | undefined;
  filteredGroupVMCountByFolder: Map<string, number>;
  filters: AttributeFilters<VmRow>;
  groupVMCountByFolder: Map<string, number>;
  handleOnSort: OnSort | undefined;
  inspectionExpandedRows: Set<string>;
  itemCount: number;
  onPerPageSelect: OnPerPageSelect;
  onSetPage: OnSetPage;
  page: number;
  pagedRows: RowNode[];
  perPage: number;
  provider: V1beta1Provider | undefined;
  rows: RowNode[];
  selectedVmKeys: string[];
  setColumns: Dispatch<SetStateAction<ResourceField[]>>;
  setInspectionExpandedRows: Dispatch<SetStateAction<Set<string>>>;
  setSelectedVmKeys: Dispatch<SetStateAction<string[]>>;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
  sortBy: { direction: 'asc' | 'desc'; index: number };
  sortedBlocks: Block[];
  visibleCols: {
    id: string;
    info?: ResourceField['info'];
    label: string;
    sortable: boolean;
  }[];
};

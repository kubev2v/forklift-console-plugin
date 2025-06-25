import type { FC } from 'react';
import type { CellProps } from 'src/modules/NetworkMaps/views/list/components/CellProps';
import { NamespaceCell } from 'src/modules/Providers/views/list/components/NamespaceCell';
import { ProviderLinkCell } from 'src/modules/Providers/views/list/components/ProviderLinkCell';
import { StatusCell } from 'src/modules/Providers/views/list/components/StatusCell';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';
import InventoryCell from 'src/providers/components/InventoryCell';
import { VirtualMachinesCell } from 'src/providers/components/VirtualMachinesCell';
import type { ProvidersResourceFieldId } from 'src/providers/utils/constants';

import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';

import { TypeCell } from '../TypeCell';
import { URLCell } from '../URLCell';

export enum ProvidersInventoryFields {
  NetworkCount = 'networkCount',
  StorageCount = 'storageCount',
  VmCount = 'vmCount',
  HostCount = 'hostCount',
  ClusterCount = 'clusterCount',
}

export const ProviderDataCellRenderers: Record<ProvidersResourceFieldId, FC<CellProps>> = {
  actions: (props) => <ProviderActionsDropdown isKebab {...props} />,
  clusterCount: (props) => <InventoryCell icon={<></>} {...props} />,
  hostCount: (props) => <InventoryCell icon={<OutlinedHddIcon />} {...props} />,
  name: ProviderLinkCell,
  namespace: NamespaceCell,
  networkCount: (props) => <InventoryCell icon={<NetworkIcon />} {...props} />,
  phase: StatusCell,
  storageCount: (props) => <InventoryCell icon={<DatabaseIcon />} {...props} />,
  type: TypeCell,
  url: URLCell,
  vmCount: VirtualMachinesCell,
};

export const SOURCE_LABEL_COLOR = 'green';
export const SOURCE_LABEL_TEXT = 'Source';

export const EMPTY_CELL_CONTENT = '-';

import type { FC } from 'react';
import type { CellProps } from 'src/modules/NetworkMaps/views/list/components/CellProps';
import { ProviderActionsDropdown } from 'src/modules/Providers/actions/ProviderActionsDropdown';
import { NamespaceCell } from 'src/modules/Providers/views/list/components/NamespaceCell';
import { ProviderLinkCell } from 'src/modules/Providers/views/list/components/ProviderLinkCell';
import { StatusCell } from 'src/modules/Providers/views/list/components/StatusCell';
import { VirtualMachinesCell } from 'src/modules/Providers/views/list/components/VirtualMachinesCell';

import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';

import type { ProvidersTableResourceFieldId } from '../../utils/constants';
import InventoryCell from '../InventoryCell';
import { TypeCell } from '../TypeCell';
import { URLCell } from '../URLCell';

export enum ProvidersInventoryFields {
  NetworkCount = 'networkCount',
  StorageCount = 'storageCount',
  VmCount = 'vmCount',
  HostCount = 'hostCount',
  ClusterCount = 'clusterCount',
}

export const ProviderDataCellRenderers: Record<ProvidersTableResourceFieldId, FC<CellProps>> = {
  actions: (props) => <ProviderActionsDropdown isKebab {...props} />,
  clusterCount: (props) => <InventoryCell icon=<></> {...props} />,
  hostCount: (props) => <InventoryCell icon=<OutlinedHddIcon /> {...props} />,
  name: ProviderLinkCell,
  namespace: NamespaceCell,
  networkCount: (props) => <InventoryCell icon=<NetworkIcon /> {...props} />,
  phase: StatusCell,
  storageCount: (props) => <InventoryCell icon=<DatabaseIcon /> {...props} />,
  type: TypeCell,
  url: URLCell,
  vmCount: VirtualMachinesCell,
};

export const SOURCE_LABEL_COLOR = 'green';
export const SOURCE_LABEL_TEXT = 'Source';

export const EMPTY_CELL_CONTENT = '-';

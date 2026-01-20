import type { FC } from 'react';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';
import InventoryCell from 'src/providers/components/InventoryCell';
import { VirtualMachinesCell } from 'src/providers/components/VirtualMachinesCell';
import type { CellProps } from 'src/providers/list/components/CellProps';
import { NamespaceCell } from 'src/providers/list/components/NamespaceCell';
import { PhaseCell } from 'src/providers/list/components/PhaseCell';
import { ProviderLinkCell } from 'src/providers/list/components/ProviderLinkCell';
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

const nullRenderer = () => null;

export const ProviderDataCellRenderers: Record<ProvidersResourceFieldId, FC<CellProps>> = {
  actions: (props) => <ProviderActionsDropdown isKebab {...props} />,
  clusterCount: (props) => <InventoryCell icon={<></>} {...props} />,
  datacenterCount: nullRenderer,
  hostCount: (props) => <InventoryCell icon={<OutlinedHddIcon />} {...props} />,
  name: ProviderLinkCell,
  namespace: NamespaceCell,
  networkCount: (props) => <InventoryCell icon={<NetworkIcon />} {...props} />,
  phase: PhaseCell,
  product: nullRenderer,
  projectCount: nullRenderer,
  regionCount: nullRenderer,
  storageCount: (props) => <InventoryCell icon={<DatabaseIcon />} {...props} />,
  type: TypeCell,
  url: URLCell,
  vmCount: VirtualMachinesCell,
  volumeTypeCount: nullRenderer,
};

export const SOURCE_LABEL_COLOR = 'green';
export const SOURCE_LABEL_TEXT = 'Source';

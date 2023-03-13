import React from 'react';
import { getResourceFieldValue } from 'common/src/components/Filter';
import * as C from 'src/utils/constants';

import { RowProps } from '@kubev2v/common/components/TableView';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DatabaseIcon, NetworkIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { HostCell } from './ProviderRow/HostCell';
import { ProviderLink } from './ProviderRow/ProviderLink';
import { StatusCell } from './ProviderRow/StatusCell';
import { TextCell } from './ProviderRow/TextCell';
import { TextWithIcon } from './ProviderRow/TextWithIcon';
import { TypeCell } from './ProviderRow/TypeCell';
import { CellProps } from './ProviderRow/types';
import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

import './styles.css';

const cellCreator: Record<string, React.FC<CellProps>> = {
  [C.NAME]: ProviderLink,
  [C.PHASE]: StatusCell,
  [C.URL]: TextCell,
  [C.TYPE]: TypeCell,
  [C.NAMESPACE]: ({ resourceData, resourceFieldId, resourceFields }: CellProps) => (
    <ResourceLink
      groupVersionKind={{ version: 'v1', kind: 'Namespace' }}
      name={getResourceFieldValue(resourceData, resourceFieldId, resourceFields)}
    />
  ),
  [C.ACTIONS]: ({ resourceData: resourceData }: CellProps) => (
    <ProviderActions resourceData={resourceData} />
  ),
  [C.NETWORK_COUNT]: ({ resourceData, resourceFieldId, resourceFields }: CellProps) => (
    <TextWithIcon
      icon={<NetworkIcon />}
      label={getResourceFieldValue(resourceData, resourceFieldId, resourceFields)}
    />
  ),
  [C.STORAGE_COUNT]: ({ resourceData, resourceFieldId, resourceFields }: CellProps) => (
    <TextWithIcon
      icon={<DatabaseIcon />}
      label={getResourceFieldValue(resourceData, resourceFieldId, resourceFields)}
    />
  ),
  [C.HOST_COUNT]: HostCell,
};

const ProviderRow: React.FC<RowProps<MergedProvider>> = ({ resourceFields, resourceData }) => {
  return (
    <Tr ouiaId={undefined} ouiaSafe={undefined}>
      {resourceFields.map(({ resourceFieldId, label }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {(cellCreator?.[resourceFieldId] ?? TextCell)({
            resourceData,
            resourceFieldId,
            resourceFields,
          })}
        </Td>
      ))}
    </Tr>
  );
};
ProviderRow.displayName = 'ProviderRow';

export default ProviderRow;

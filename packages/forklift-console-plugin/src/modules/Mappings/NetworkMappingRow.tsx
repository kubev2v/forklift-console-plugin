import React, { useState } from 'react';
import { RowProps } from 'common/src/components/TableView';
import { MappingDetailView } from 'legacy/src/Mappings/components/MappingDetailView';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon, NetworkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';

import { FlatNetworkMapping, Network } from './data';
import { NetworkMappingActions } from './networkMappingActions';
interface CellProps {
  value: string;
  entity: FlatNetworkMapping;
  currentNamespace: string;
  t: (key: string, params?: { [k: string]: string | number }) => string;
}

const TextCell = ({ value }: CellProps) => <>{value ?? ''}</>;

const SourceNetworksCell = ({ t, entity }: CellProps) => {
  const singleGroup = entity.from.length === 1;
  return (
    <>
      <NetworkIcon /> {/*keep ' ' spacer */}
      {singleGroup && entity.from[0][1].length}
      {!singleGroup && t('{{groupCount}} Groups', { groupCount: entity.from.length })}
    </>
  );
};

const networkName = (n: Network, t: (k: string) => string) =>
  n.type === 'pod' ? t('Pod network') : `${n.namespace}/${n.name}`;

const TargetNetworksCell = ({ t, entity }: CellProps) => (
  <>
    {entity.to.map((n) => {
      return (
        <>
          <Label key={networkName(n, t)} color="blue">
            {networkName(n, t)}
          </Label>{' '}
        </>
      );
    })}
  </>
);

const Ref = ({
  gvk,
  name,
  namespace,
  resolved,
}: {
  gvk: K8sGroupVersionKind;
  name: string;
  namespace: string;
  resolved: boolean;
}) => {
  const { t } = useTranslation();
  return resolved ? (
    <ResourceLink groupVersionKind={gvk} name={name} namespace={namespace} />
  ) : (
    <Tooltip content={t('Provider {{name}} cannot be resolved', { name })}>
      <span>
        <ExclamationCircleIcon color="#C9190B" /> {name}
      </span>
    </Tooltip>
  );
};

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: ({ entity: e }: CellProps) => (
    <Ref gvk={e.gvk} name={e.name} namespace={e.namespace} resolved />
  ),
  [C.SOURCE]: ({ entity: e }: CellProps) => (
    <Ref gvk={e.sourceGvk} name={e.source} namespace={e.namespace} resolved={e.sourceResolved} />
  ),
  [C.TARGET]: ({ entity: e }: CellProps) => (
    <Ref gvk={e.targetGvk} name={e.target} namespace={e.namespace} resolved={e.targetResolved} />
  ),
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.ACTIONS]: ({ entity }: CellProps) => <NetworkMappingActions entity={entity} />,
  [C.FROM]: SourceNetworksCell,
  [C.TO]: TargetNetworksCell,
};

const NetworkMappingRow = ({ columns, entity, currentNamespace }: RowProps<FlatNetworkMapping>) => {
  const { t } = useTranslation();
  const [isRowExpanded, setiIsRowExpanded] = useState(false);
  return (
    <>
      <Tr>
        {columns.map(({ id, toLabel }) => {
          const Cell = cellCreator[id] ?? TextCell;
          return (
            <Td
              key={id}
              dataLabel={toLabel(t)}
              compoundExpand={
                id === C.FROM || id === C.TO
                  ? { isExpanded: isRowExpanded, onToggle: () => setiIsRowExpanded(!isRowExpanded) }
                  : undefined
              }
            >
              <Cell
                value={String(entity[id] ?? '')}
                entity={entity}
                t={t}
                currentNamespace={currentNamespace}
              />
            </Td>
          );
        })}
      </Tr>
      {isRowExpanded ? (
        <Tr isExpanded={isRowExpanded}>
          <Td dataLabel="MappingGraph" noPadding colSpan={columns.length}>
            <ExpandableRowContent>
              <MappingDetailView
                mappingType={MappingType.Network}
                mapping={entity.object}
                className={spacing.mLg}
              />
            </ExpandableRowContent>
          </Td>
        </Tr>
      ) : null}
    </>
  );
};

export default NetworkMappingRow;

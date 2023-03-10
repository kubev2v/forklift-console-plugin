import React, { useCallback, useState } from 'react';
import { getResourceFieldValue } from 'common/src/components/Filter';
import { RowProps } from 'common/src/components/TableView';
import { MappingDetailView } from 'legacy/src/Mappings/components/MappingDetailView';
import { Mapping, MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';

import { CommonMapping } from './data';

export interface CellProps<T extends CommonMapping> {
  value: string;
  resourceData: T;
  currentNamespace: string;
  t: (key: string, params?: { [k: string]: string | number }) => string;
}

const TextCell = ({ value }: CellProps<CommonMapping>) => <>{value ?? ''}</>;

export const SourceCell = ({
  itemsInFirstGroup = [],
  groups = [],
  Icon,
}: {
  itemsInFirstGroup: unknown[];
  groups: unknown[];
  Icon: React.ComponentClass;
}) => {
  const { t } = useTranslation();
  const isSingleGroup = groups.length === 1;
  return (
    <>
      <Icon /> {/*keep ' ' spacer */}
      {isSingleGroup && itemsInFirstGroup.length}
      {!isSingleGroup && t('{{groupCount}} Groups', { groupCount: groups.length })}
    </>
  );
};

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

export type CellCreator<T extends CommonMapping> = Record<
  string,
  (props: CellProps<T>) => JSX.Element
>;

export const commonCells: CellCreator<CommonMapping> = {
  [C.NAME]: ({ resourceData: e }: CellProps<CommonMapping>) => (
    <Ref gvk={e.gvk} name={e.name} namespace={e.namespace} resolved />
  ),
  [C.SOURCE]: ({ resourceData: e }: CellProps<CommonMapping>) => (
    <Ref gvk={e.sourceGvk} name={e.source} namespace={e.namespace} resolved={e.sourceResolved} />
  ),
  [C.TARGET]: ({ resourceData: e }: CellProps<CommonMapping>) => (
    <Ref gvk={e.targetGvk} name={e.target} namespace={e.namespace} resolved={e.targetResolved} />
  ),
  [C.NAMESPACE]: ({ value }: CellProps<CommonMapping>) => (
    <ResourceLink kind="Namespace" name={value} />
  ),
};

function MappingRow<T extends CommonMapping>({
  rowProps: { resourceFields, resourceData, currentNamespace, rowIndex },
  cellCreator,
  mappingType,
  mapping,
}: {
  rowProps: RowProps<T>;
  cellCreator: CellCreator<T>;
  mappingType: MappingType;
  mapping: Mapping;
}) {
  const { t } = useTranslation();
  const [isRowExpanded, setIsRowExpanded] = useState(false);
  const toggleExpand = useCallback(
    () => setIsRowExpanded(!isRowExpanded),
    [isRowExpanded, setIsRowExpanded],
  );
  return (
    <>
      <Tr>
        <Td
          expand={{
            rowIndex,
            isExpanded: isRowExpanded,
            onToggle: toggleExpand,
          }}
        />
        {resourceFields.map(({ resourceFieldID, label }) => {
          const Cell = cellCreator[resourceFieldID] ?? TextCell;
          return (
            <Td
              key={resourceFieldID}
              dataLabel={label}
              compoundExpand={
                resourceFieldID === C.FROM || resourceFieldID === C.TO
                  ? { isExpanded: isRowExpanded, onToggle: toggleExpand }
                  : undefined
              }
            >
              <Cell
                value={String(
                  getResourceFieldValue(resourceData, resourceFieldID, resourceFields) ?? '',
                )}
                resourceData={resourceData}
                t={t}
                currentNamespace={currentNamespace}
              />
            </Td>
          );
        })}
      </Tr>
      <Tr isExpanded={isRowExpanded}>
        <Td dataLabel={t('Mapping graph')} noPadding colSpan={resourceFields.length}>
          {isRowExpanded && (
            <ExpandableRowContent>
              <MappingDetailView
                mappingType={mappingType}
                mapping={mapping}
                className={spacing.mLg}
              />
            </ExpandableRowContent>
          )}
        </Td>
      </Tr>
    </>
  );
}

export default MappingRow;

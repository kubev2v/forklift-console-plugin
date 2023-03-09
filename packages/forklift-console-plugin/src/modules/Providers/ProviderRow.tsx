import React, { JSXElementConstructor } from 'react';
import { Link } from 'react-router-dom';
import { getFieldValue } from 'common/src/components/Filter';
import jsonpath from 'jsonpath';
import * as C from 'src/utils/constants';
import { IS_MANAGED_JSONPATH } from 'src/utils/constants';
import { PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';

import { RowProps } from '@kubev2v/common/components/TableView';
import {
  PATH_PREFIX,
  ProviderType,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '@kubev2v/legacy/common/constants';
import {
  getGroupVersionKindForResource,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Label, Popover, Spinner } from '@patternfly/react-core';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { V1beta1Provider } from '../../../../types/src/models';

import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

import './styles.css';

interface CellProps {
  value: string;
  entity: MergedProvider;
  t?: (k: string) => string;
  currentNamespace?: string;
}

const statusIcons = {
  ValidationFailed: <RedExclamationCircleIcon />,
  ConnectionFailed: <RedExclamationCircleIcon />,
  Ready: <GreenCheckCircleIcon />,
  Staging: <Spinner size="sm" />,
};

const statusLabel = {
  ValidationFailed: 'Validation Failed',
  ConnectionFailed: 'Connection Failed',
  Ready: 'Ready',
  Staging: 'Staging',
};

const StatusCell = ({ entity }: CellProps) => {
  const allConditions = entity?.status?.conditions || [];
  const phase = entity?.status?.phase;

  if (allConditions.length === 0) {
    return (
      <>
        {statusIcons[phase] || ''} {statusLabel[phase] || phase || ''}
      </>
    );
  }

  const conditionsTable = (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
      {allConditions.map((condition) => (
        <FlexItem key={condition.type}>
          <Flex>
            <FlexItem>
              <strong>{condition.type}</strong>
            </FlexItem>
            <FlexItem>{condition?.message}</FlexItem>
          </Flex>
        </FlexItem>
      ))}
    </Flex>
  );

  return (
    <Popover bodyContent={conditionsTable}>
      <Button variant="link" isInline aria-label={''}>
        {statusIcons[phase] || ''} {statusLabel[phase] || phase || ''}
      </Button>
    </Popover>
  );
};
StatusCell.displayName = 'StatusCell';

const TextCell = ({ value }: { value: string }) => <>{value ?? ''}</>;
TextCell.displayName = 'TextCell';

const TextWithIcon = ({ value, Icon }: { value: string; Icon: JSXElementConstructor<unknown> }) => (
  <>
    {value && (
      <>
        <Icon /> <TextCell value={value} />
      </>
    )}
  </>
);
TextWithIcon.displayName = 'TextWithIcon';

const ProviderLink = ({ entity, t }: CellProps) => {
  const isOwned = entity && jsonpath.query(entity, IS_MANAGED_JSONPATH).length > 0;

  return (
    <span className="forklift-table__flex-cell">
      <ResourceLink
        groupVersionKind={getGroupVersionKindForResource(entity as unknown as V1beta1Provider)}
        name={entity?.metadata?.name}
        namespace={entity?.metadata?.namespace}
      />
      {isOwned && (
        <Label isCompact color="grey" className="forklift-table__flex-cell-label">
          {t('managed')}
        </Label>
      )}
    </span>
  );
};
ProviderLink.displayName = 'ProviderLink';

const HostCell = ({ value, entity, currentNamespace }: CellProps) => (
  <>
    {entity?.status?.phase === 'Ready' && value && entity?.spec.type === 'vsphere' ? (
      <Link
        to={
          currentNamespace
            ? `${PATH_PREFIX}/providers/vsphere/ns/${currentNamespace}/${entity?.metadata?.name}`
            : `${PATH_PREFIX}/providers/vsphere/${entity?.metadata?.name}`
        }
      >
        <TextWithIcon Icon={OutlinedHddIcon} value={value} />
      </Link>
    ) : (
      <TextWithIcon Icon={OutlinedHddIcon} value={value} />
    )}
  </>
);
HostCell.displayName = 'HostCell';

const TypeCell = ({ value, t }: CellProps) => (
  <span className="forklift-table__flex-cell">
    {PROVIDERS?.[value]?.(t)}
    {SOURCE_PROVIDER_TYPES.includes(value as ProviderType) && (
      <>
        <Label isCompact color="green" className="forklift-table__flex-cell-label">
          {t('Source').toLowerCase()}
        </Label>
      </>
    )}
    {TARGET_PROVIDER_TYPES.includes(value as ProviderType) && (
      <>
        <Label isCompact color="blue" className="forklift-table__flex-cell-label">
          {t('Target').toLowerCase()}
        </Label>
      </>
    )}
  </span>
);
TypeCell.displayName = 'TypeCell';

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: ProviderLink,
  [C.PHASE]: StatusCell,
  [C.URL]: TextCell,
  [C.TYPE]: TypeCell,
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.ACTIONS]: ({ entity }: CellProps) => <ProviderActions entity={entity} />,
  [C.NETWORK_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={NetworkIcon} value={value} />,
  [C.STORAGE_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={DatabaseIcon} value={value} />,
  [C.HOST_COUNT]: HostCell,
};

const ProviderRow = ({ columns, entity, currentNamespace }: RowProps<MergedProvider>) => {
  const { t } = useTranslation();
  return (
    <Tr>
      {columns.map(({ id, toLabel }) => (
        <Td key={id} dataLabel={toLabel(t)}>
          {cellCreator?.[id]?.({
            value: getFieldValue(entity, id, columns),
            entity,
            t,
            currentNamespace,
          }) ?? <TextCell value={String(getFieldValue(entity, id, columns) ?? '')} />}
        </Td>
      ))}
    </Tr>
  );
};
ProviderRow.displayName = 'ProviderRow';

export default ProviderRow;

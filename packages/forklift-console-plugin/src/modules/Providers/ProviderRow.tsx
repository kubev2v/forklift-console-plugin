import React, { JSXElementConstructor } from 'react';
import { Link } from 'react-router-dom';
import * as C from 'src/utils/constants';
import { PROVIDER_STATUS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { ProviderPhase } from 'src/utils/types';

import { RowProps } from '@kubev2v/common/components/TableView';
import {
  PATH_PREFIX,
  ProviderType,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '@kubev2v/legacy/common/constants';
import { StatusIcon } from '@migtools/lib-ui';
import {
  BlueInfoCircleIcon,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Label, Popover } from '@patternfly/react-core';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

import './styles.css';

interface CellProps {
  value: string;
  entity: MergedProvider;
  t?: (k: string) => string;
  currentNamespace?: string;
}

const ProviderPhaseToStatus = (phase: ProviderPhase): 'Error' | 'Ok' | 'Unknown' | 'Loading' => {
  switch (phase) {
    case 'Ready':
      return 'Ok';
    case 'ConnectionFailed':
    case 'ValidationFailed':
      return 'Error';
    case 'Staging':
      return 'Loading';
    default:
      return 'Unknown';
  }
};

const CategoryToIconMap = {
  Critical: <RedExclamationCircleIcon />,
  Error: <RedExclamationCircleIcon />,
  Required: <GreenCheckCircleIcon />,
  Warn: <BlueInfoCircleIcon />,
  Advisory: <GreenCheckCircleIcon />,
};

const StatusCell = ({ value, entity: { phase, object }, t }: CellProps) => {
  const allConditions = (object?.status?.conditions || []).map(({ message, category }) => (
    <Flex
      key={message.valueOf()}
      spaceItems={{ default: 'spaceItemsXs' }}
      display={{ default: 'inlineFlex' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>{CategoryToIconMap[category] || <BlueInfoCircleIcon />}</FlexItem>
      <FlexItem>{message}</FlexItem>
    </Flex>
  ));

  const CellLabel = PROVIDER_STATUS[value]?.(t) ?? t('Unknown');
  let bodyContent: React.ReactNode;

  switch (allConditions.length) {
    case 0:
      bodyContent = '';
      break;
    case 1:
      bodyContent = object?.status?.conditions[0].message || '';
      break;
    default:
      bodyContent = allConditions;
  }

  if (bodyContent === '') {
    return <StatusIcon status={ProviderPhaseToStatus(phase)} label={CellLabel} />;
  } else {
    return (
      <Popover bodyContent={bodyContent}>
        <Button variant="link" isInline aria-label={CellLabel}>
          <StatusIcon status={ProviderPhaseToStatus(phase)} label={CellLabel} />
        </Button>
      </Popover>
    );
  }
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

const ProviderLink = ({ value, entity: { gvk, namespace, isOwnedByController }, t }: CellProps) => {
  return (
    <span className="forklift-table__flex-cell">
      <ResourceLink groupVersionKind={gvk} name={value} namespace={namespace} />
      {isOwnedByController && (
        <Label isCompact color="grey" className="forklift-table__flex-cell-label">
          {t('managed')}
        </Label>
      )}
    </span>
  );
};
ProviderLink.displayName = 'ProviderLink';

const HostCell = ({ value, entity: { phase, name, type }, currentNamespace }: CellProps) => (
  <>
    {phase === 'Ready' && value && type === 'vsphere' ? (
      <Link
        to={
          currentNamespace
            ? `${PATH_PREFIX}/providers/vsphere/ns/${currentNamespace}/${name}`
            : `${PATH_PREFIX}/providers/vsphere/${name}`
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
            value: entity[id],
            entity,
            t,
            currentNamespace,
          }) ?? <TextCell value={String(entity[id] ?? '')} />}
        </Td>
      ))}
    </Tr>
  );
};
ProviderRow.displayName = 'ProviderRow';

export default ProviderRow;

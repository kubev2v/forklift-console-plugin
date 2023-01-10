import React, { JSXElementConstructor } from 'react';
import { Link } from 'react-router-dom';
import { RowProps } from 'src/components/TableView';
import * as C from 'src/utils/constants';
import { CONDITIONS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';

import {
  PATH_PREFIX,
  ProviderType,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '@app/common/constants';
import { StatusIcon } from '@migtools/lib-ui';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Label, Popover } from '@patternfly/react-core';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { MergedProvider, SupportedConditions } from './data';
import { ProviderActions } from './providerActions';

interface CellProps {
  value: string;
  entity: MergedProvider;
  t?: (k: string) => string;
  currentNamespace?: string;
}

/**
 * assumes that if condition is 'True' then
 * this is a positive state (success, "green")
 * i.e. ConnectionTestSucceeded
 */
const toPositiveState = (conditionValue: string): 'Error' | 'Ok' | 'Unknown' => {
  switch (conditionValue) {
    case 'True':
      return 'Ok';
    case 'False':
      return 'Error';
    default:
      return 'Unknown';
  }
};

const toNegativeState = (conditionValue: string): 'Error' | 'Ok' | 'Unknown' => {
  switch (conditionValue) {
    case 'True':
      return 'Error';
    case 'False':
      return 'Ok';
    default:
      return 'Unknown';
  }
};

const StatusCell = ({
  value,
  entity: { positiveConditions, negativeConditions },
  t,
}: CellProps) => {
  const allConditions = [
    [positiveConditions, toPositiveState],
    [negativeConditions, toNegativeState],
  ].flatMap(
    ([conditions, toState]: [
      SupportedConditions,
      (value: string) => 'Error' | 'Ok' | 'Unknown',
    ]) => [
      ...Object.values(conditions)
        .filter(Boolean)
        .map(({ message, status }) => {
          return <StatusIcon key={message} status={toState(status)} label={message} />;
        }),
    ],
  );

  const label = CONDITIONS[value]?.(t) ?? t('Unknown');
  return (
    <Popover
      hasAutoWidth
      bodyContent={<div>{allConditions.length > 0 ? allConditions : t('No information')}</div>}
    >
      <Button variant="link" isInline aria-label={label}>
        <StatusIcon status={toPositiveState(value)} label={label} />
      </Button>
    </Popover>
  );
};

const TextCell = ({ value }: { value: string }) => <>{value ?? ''}</>;

const TextWithIcon = ({ value, Icon }: { value: string; Icon: JSXElementConstructor<unknown> }) => (
  <>
    {value && (
      <>
        <Icon /> <TextCell value={value} />
      </>
    )}
  </>
);

const ProviderLink = ({ value, entity, t }: CellProps) => {
  const isHostProvider = entity.type === 'openshift' && !entity.url;
  return (
    <>
      <ResourceLink groupVersionKind={entity.gvk} name={value} namespace={entity?.namespace} />{' '}
      {isHostProvider && (
        <Label isCompact color="grey">
          {t('default')}
        </Label>
      )}
    </>
  );
};

const HostCell = ({ value, entity: { ready, name, type }, currentNamespace }: CellProps) => (
  <>
    {ready === 'True' && value && type === 'vsphere' ? (
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

const TypeCell = ({ value, t }: CellProps) => (
  <>
    {PROVIDERS?.[value]?.(t)}
    {SOURCE_PROVIDER_TYPES.includes(value as ProviderType) && (
      <>
        {' '}
        <Label isCompact color="green">
          {t('Source').toLowerCase()}
        </Label>
      </>
    )}
    {TARGET_PROVIDER_TYPES.includes(value as ProviderType) && (
      <>
        {' '}
        <Label isCompact color="blue">
          {t('Target').toLowerCase()}
        </Label>
      </>
    )}
  </>
);

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: ProviderLink,
  [C.READY]: StatusCell,
  [C.URL]: TextCell,
  [C.TYPE]: TypeCell,
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.ACTIONS]: ProviderActions,
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

export default ProviderRow;

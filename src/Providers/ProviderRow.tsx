import React from 'react';
import { RowProps } from 'src/components/TableView';
import { useTranslation } from 'src/internal/i18n';
import { NAME, NAMESPACE, READY, TYPE, URL } from 'src/utils/constants';

import { StatusIcon } from '@migtools/lib-ui';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

interface CellProps {
  value: string;
  entity: MergedProvider;
}
const StatusCell = ({ value, entity: { conditions } }: CellProps) => {
  const { t } = useTranslation();
  const existingConditions = Object.values(conditions).filter(Boolean);
  const toState = (value) => {
    switch (value) {
      case 'True':
        return 'Ok';
      case 'False':
        return 'Error';
      default:
        return 'Unknown';
    }
  };
  const label = ((value) => {
    switch (value) {
      case 'True':
        return t('True');
      case 'False':
        return t('False');
      default:
        return t('Unknown');
    }
  })(value);
  return (
    <Popover
      hasAutoWidth
      bodyContent={
        <div>
          {existingConditions.length > 0
            ? existingConditions.map(({ message, status }) => {
                return <StatusIcon key={message} status={toState(status)} label={message} />;
              })
            : t('No information')}
        </div>
      }
    >
      <Button variant="link" isInline aria-label={label}>
        <StatusIcon status={toState(value)} label={label} />
      </Button>
    </Popover>
  );
};

const TextCell = ({ value }: { value: string }) => <>{value}</>;

const ProviderLink = ({ value, entity }: CellProps) => (
  <ResourceLink kind={entity.kind} name={value} namespace={entity?.namespace} />
);

const cellCreator = {
  [NAME]: ProviderLink,
  [READY]: StatusCell,
  [URL]: TextCell,
  [TYPE]: TextCell,
  [NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
};

const ProviderRow = ({ columns, entity }: RowProps<MergedProvider>) => {
  const { t } = useTranslation();
  return (
    <Tr>
      {columns.map(({ id, toLabel }) => (
        <Td key={id} dataLabel={toLabel(t)}>
          {cellCreator?.[id]?.({
            value: entity[id],
            entity,
          }) ?? <TextCell value={String(entity[id] ?? '')} />}
        </Td>
      ))}
      <Td modifier="fitContent">
        <ProviderActions entity={entity} />
      </Td>
    </Tr>
  );
};

export default ProviderRow;

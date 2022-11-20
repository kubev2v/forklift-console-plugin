import React, { JSXElementConstructor } from 'react';
import { Link } from 'react-router-dom';
import { RowProps } from 'src/components/TableView';
import * as C from 'src/utils/constants';
import { CONDITIONS, PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';

import { PATH_PREFIX } from '@app/common/constants';
import { StatusIcon } from '@migtools/lib-ui';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover } from '@patternfly/react-core';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

interface CellProps {
  value: string;
  entity: MergedProvider;
  t?: (k: string) => string;
}

const StatusCell = ({ value, entity: { conditions }, t }: CellProps) => {
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

  const label = CONDITIONS[value]?.(t) ?? t('Unknown');
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

const ProviderLink = ({ value, entity }: CellProps) => (
  <ResourceLink kind={entity.kind} name={value} namespace={entity?.namespace} />
);

const HostCell = ({ value, entity: { ready, name, type } }: CellProps) => (
  <>
    {ready === 'True' && value && type === 'vsphere' ? (
      <Link to={`${PATH_PREFIX}/providers/vsphere/${name}`}>
        <TextWithIcon Icon={OutlinedHddIcon} value={value} />
      </Link>
    ) : (
      <TextWithIcon Icon={OutlinedHddIcon} value={value} />
    )}
  </>
);

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: ProviderLink,
  [C.READY]: StatusCell,
  [C.URL]: TextCell,
  [C.TYPE]: ({ value, t }: CellProps) => <TextCell value={PROVIDERS?.[value]?.(t)} />,
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.ACTIONS]: ProviderActions,
  [C.NETWORK_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={NetworkIcon} value={value} />,
  [C.STORAGE_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={DatabaseIcon} value={value} />,
  [C.HOST_COUNT]: HostCell,
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
            t,
          }) ?? <TextCell value={String(entity[id] ?? '')} />}
        </Td>
      ))}
    </Tr>
  );
};

export default ProviderRow;

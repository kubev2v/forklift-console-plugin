import React, { JSXElementConstructor } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom';
import { getResourceFieldValue } from 'common/src/components/Filter';
import * as C from 'src/utils/constants';
import { PROVIDERS } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { ProviderStatus } from 'src/utils/types';

import { RowProps } from '@kubev2v/common/components/TableView';
import {
  PATH_PREFIX,
  ProviderType,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '@kubev2v/legacy/common/constants';
import { V1beta1ProviderStatusConditions } from '@kubev2v/types/src/models';
import { StatusIcon } from '@migtools/lib-ui';
import {
  BlueInfoCircleIcon,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  ResourceLink,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Label, Popover } from '@patternfly/react-core';
import { DatabaseIcon, NetworkIcon, OutlinedHddIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { MergedProvider } from './data';
import { ProviderActions } from './providerActions';

import './styles.css';

interface CellProps {
  value: string;
  resourceData: MergedProvider;
  t?: (k: string) => string;
  currentNamespace?: string;
}

const phaseToStatus = (phase: ProviderStatus): 'Error' | 'Ok' | 'Unknown' | 'Loading' => {
  const phaseToStatusMap = {
    Ready: 'Ok',
    ConnectionFailed: 'Error',
    ValidationFailed: 'Error',
    Staging: 'Loading',
  };

  return phaseToStatusMap[phase] || 'Undefined';
};

const phaseToLabel = (phase: ProviderStatus, t): string => {
  const phaseToLabelMap = {
    Ready: t('Ready'),
    ConnectionFailed: t('Connection Failed'),
    ValidationFailed: t('Validation Failed'),
    Staging: t('Staging'),
  };

  return phaseToLabelMap[phase] || t('Undefined');
};

const ConditionToIcon = (condition: V1beta1ProviderStatusConditions): React.ReactNode => {
  const categoryToIconMap = {
    Critical: { True: <RedExclamationCircleIcon />, False: undefined },
    Error: { True: <RedExclamationCircleIcon />, False: undefined },
    Required: { True: <GreenCheckCircleIcon />, False: undefined },
    Warn: { True: <YellowExclamationTriangleIcon />, False: undefined },
    Advisory: { True: <GreenCheckCircleIcon />, False: undefined },
  };

  return categoryToIconMap[condition.category]?.[condition.status];
};

const StatusCell = ({ resourceData: { phase, object } }: CellProps) => {
  const { t } = useTranslation();

  const providerHasConditions = object?.status?.conditions && object?.status?.conditions.length > 0;

  if (!providerHasConditions) {
    return <StatusIcon status={phaseToStatus(phase)} label={phaseToLabel(phase, t)} />;
  }

  const allConditions = object.status.conditions.map((condition) => (
    <Flex
      key={condition.type}
      spaceItems={{ default: 'spaceItemsXs' }}
      display={{ default: 'inlineFlex' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>{ConditionToIcon(condition) || <BlueInfoCircleIcon />}</FlexItem>
      <FlexItem>
        <Linkify>{condition.message || condition.type}</Linkify>
      </FlexItem>
    </Flex>
  ));

  return (
    <Popover bodyContent={allConditions}>
      <Button variant="link" isInline aria-label={phaseToLabel(phase, t)}>
        <StatusIcon status={phaseToStatus(phase)} label={phaseToLabel(phase, t)} />
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

const ProviderLink = ({
  value,
  resourceData: { gvk, namespace, isOwnedByController },
  t,
}: CellProps) => {
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

const HostCell = ({ value, resourceData: { phase, name, type }, currentNamespace }: CellProps) => (
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
    {PROVIDERS?.[value]}
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
  [C.ACTIONS]: ({ resourceData }: CellProps) => <ProviderActions resourceData={resourceData} />,
  [C.NETWORK_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={NetworkIcon} value={value} />,
  [C.STORAGE_COUNT]: ({ value }: CellProps) => <TextWithIcon Icon={DatabaseIcon} value={value} />,
  [C.HOST_COUNT]: HostCell,
};

const ProviderRow = ({
  resourceFields,
  resourceData,
  currentNamespace,
}: RowProps<MergedProvider>) => {
  const { t } = useTranslation();
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId, label }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {cellCreator?.[resourceFieldId]?.({
            value: getResourceFieldValue(resourceData, resourceFieldId, resourceFields),
            resourceData,
            t,
            currentNamespace,
          }) ?? (
            <TextCell
              value={String(
                getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? '',
              )}
            />
          )}
        </Td>
      ))}
    </Tr>
  );
};
ProviderRow.displayName = 'ProviderRow';

export default ProviderRow;

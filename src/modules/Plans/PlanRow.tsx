import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as C from '_/utils/constants';
import { PLAN_TYPE } from '_/utils/enums';
import { RowProps } from 'src/components/TableView';
import { useTranslation } from 'src/utils/i18n';

import { MustGatherBtn } from '@app/common/components/MustGatherBtn';
import { StatusCondition } from '@app/common/components/StatusCondition';
import { PATH_PREFIX } from '@app/common/constants';
import { getButtonState, getMigStatusState } from '@app/Plans/components/helpers';
import { MigrateOrCutoverButton } from '@app/Plans/components/MigrateOrCutoverButton';
import { PlanNameNavLink as Link } from '@app/Plans/components/PlanStatusNavLink';
import { ScheduledCutoverTime } from '@app/Plans/components/ScheduledCutoverTime';
import { StatusIcon } from '@migtools/lib-ui';
import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Flex,
  FlexItem,
  Label,
  Progress,
  ProgressMeasureLocation,
  Truncate,
} from '@patternfly/react-core';
import { ArchiveIcon, VirtualMachineIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { FlatPlan } from './data';
import { PlanActions } from './planActions';

import './styles.css';

interface CellProps {
  value: string;
  entity: FlatPlan;
  primaryAction?: string;
  currentNamespace: string;
}

const TextCell = ({ value }: CellProps) => <>{value ?? ''}</>;

const StatusCell = ({ entity: { status, type, vmCount, vmDone, name, object } }: CellProps) => {
  const { t } = useTranslation();
  const isBeingStarted = status === 'Starting';
  const isWarmPlan = type === 'Warm';
  const { title, variant } = getMigStatusState(status, isWarmPlan);

  if (status === 'Archiving') {
    return <Link name={name}>{t('Archiving')}</Link>;
  } else if (status === 'Archived') {
    return (
      <Link name={name}>
        <ArchiveIcon /> {t('Archived')}
      </Link>
    );
  } else if (isBeingStarted && !isWarmPlan) {
    return <Link name={name}>{t('Running - preparing for migration')}</Link>;
  } else if (isBeingStarted && isWarmPlan) {
    return <Link name={name}>{t('Running - preparing for incremental data copies')}</Link>;
  } else if (status === 'Unknown') {
    return <StatusIcon status="Warning" label="Unknown" />;
  } else if (status === 'NotStarted-Ready' || status === 'NotStarted-NotReady') {
    return <StatusCondition status={object.status} />;
  } else if (status === 'Copying' || status === 'Copying-CutoverScheduled') {
    return <Link name={name}>{t('Running - performing incremental data copies')}</Link>;
  } else if (status === 'StartingCutover') {
    return <Link name={name}>{t('Running - preparing for cutover')}</Link>;
  } else {
    return (
      <Link name={name} isInline={false}>
        <Progress
          title={title}
          value={vmCount ? (vmDone * 100) / vmCount : 0}
          label={t('{{vmDone}} of {{vmCount}} VMs migrated', { vmDone, vmCount })}
          valueText={t('{{vmDone}} of {{vmCount}} VMs migrated', { vmDone, vmCount })}
          variant={variant}
          measureLocation={ProgressMeasureLocation.top}
        />
      </Link>
    );
  }
};
StatusCell.displayName = 'StatusCell';

const Actions = ({ primaryAction, entity, currentNamespace }: CellProps) => {
  const isBeingStarted = entity.status === 'Starting';
  return (
    <Flex
      flex={{ default: 'flex_2' }}
      spaceItems={{ default: 'spaceItemsNone' }}
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'nowrap' }}
    >
      {primaryAction && (
        <FlexItem align={{ default: 'alignRight' }}>
          {primaryAction === 'MustGather' && (
            <MustGatherBtn
              type="plan"
              isCompleted={!!entity.migrationCompleted}
              displayName={entity.name}
            />
          )}
          {primaryAction === 'ScheduledCutover' && (
            <ScheduledCutoverTime cutover={entity.latestMigration?.cutover} />
          )}
          {(primaryAction === 'Start' || primaryAction === 'Cutover') && (
            <MigrateOrCutoverButton
              plan={entity.object}
              buttonType={primaryAction}
              isBeingStarted={isBeingStarted}
              currentNamespace={currentNamespace}
            />
          )}
        </FlexItem>
      )}
      {(primaryAction || !isBeingStarted) && (
        <FlexItem align={{ default: 'alignRight' }}>
          <PlanActions
            {...{
              entity,
              ignoreList: primaryAction ? [primaryAction] : [],
              namespace: currentNamespace,
            }}
          />
        </FlexItem>
      )}
    </Flex>
  );
};
Actions.displayName = 'Actions';

const Ref = ({
  gvk,
  name,
  namespace,
}: {
  gvk: K8sGroupVersionKind;
  name: string;
  namespace: string;
}) => <ResourceLink groupVersionKind={gvk} name={name} namespace={namespace} />;

const NameCell = ({ entity: e }: CellProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Ref gvk={e.gvk} name={e.name} namespace={e.namespace} />{' '}
      {e.type === 'Cold' && (
        <Label isCompact color="blue">
          {PLAN_TYPE.Cold(t).toLowerCase()}
        </Label>
      )}
      {e.type === 'Warm' && (
        <Label isCompact color="orange">
          {PLAN_TYPE.Warm(t).toLowerCase()}
        </Label>
      )}
    </>
  );
};
NameCell.displayName = 'NameCell';

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: NameCell,
  [C.SOURCE]: ({ entity: e }: CellProps) => (
    <Ref gvk={e.sourceGvk} name={e.source} namespace={e.namespace} />
  ),
  [C.TARGET]: ({ entity: e }: CellProps) => (
    <Ref gvk={e.targetGvk} name={e.target} namespace={e.namespace} />
  ),
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.STATUS]: StatusCell,
  [C.ACTIONS]: Actions,
  [C.VM_COUNT]: ({ value, entity }: CellProps) => (
    <RouterLink to={`${PATH_PREFIX}/plans/${entity.name}`}>
      <VirtualMachineIcon /> {value}
    </RouterLink>
  ),
};

const PlanRow = ({ columns, entity, currentNamespace }: RowProps<FlatPlan>) => {
  const { t } = useTranslation();
  const primaryAction = getButtonState(entity.status);
  return (
    <Tr>
      {columns.map(({ id, toLabel }) => {
        const Cell = cellCreator[id] ?? TextCell;
        return id === C.DESCRIPTION ? (
          [
            <Td key={`${C.DESCRIPTION}_large`} visibility={['hidden', 'visibleOnMd']} width={20}>
              <Truncate content={entity.description ?? ''} />
            </Td>,
            <Td dataLabel={toLabel(t)} key={`${C.DESCRIPTION}_small`} visibility={['hiddenOnMd']}>
              {entity.description ?? ''}
            </Td>,
          ]
        ) : (
          <Td key={id} dataLabel={toLabel(t)}>
            <Cell
              value={String(entity[id] ?? '')}
              entity={entity}
              primaryAction={primaryAction}
              currentNamespace={currentNamespace}
            />
          </Td>
        );
      })}
    </Tr>
  );
};
PlanRow.displayName = 'PlanRow';

export default PlanRow;

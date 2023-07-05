import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as C from 'src/utils/constants';
import { PLAN_TYPE } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';
import { RowProps } from '@kubev2v/common';
import { StatusCondition } from '@kubev2v/legacy/common/components/StatusCondition';
import { PATH_PREFIX } from '@kubev2v/legacy/common/constants';
import {
  getMigStatusState,
  getPrimaryActionFromPlanState,
} from '@kubev2v/legacy/Plans/components/helpers';
import { MigrateOrCutoverButton } from '@kubev2v/legacy/Plans/components/MigrateOrCutoverButton';
import { PlanNameNavLink as Link } from '@kubev2v/legacy/Plans/components/PlanStatusNavLink';
import { ScheduledCutoverTime } from '@kubev2v/legacy/Plans/components/ScheduledCutoverTime';
import { StatusIcon } from '@migtools/lib-ui';
import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Flex,
  FlexItem,
  Label,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Truncate,
} from '@patternfly/react-core';
import { ArchiveIcon, VirtualMachineIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { FlatPlan } from './data';
import { PlanActions } from './planActions';

import './styles.css';

interface CellProps {
  value: string;
  resourceData: FlatPlan;
  primaryAction?: string;
  currentNamespace: string;
}

const TextCell = ({ value }: CellProps) => <>{value ?? ''}</>;

const StatusCell = ({
  resourceData: { status, type, vmCount, vmDone, name, object, namespace },
}: CellProps) => {
  const { t } = useForkliftTranslation();
  const isBeingStarted = status === 'Starting';
  const isWarmPlan = type === 'Warm';
  const { title, variant } = getMigStatusState(status, isWarmPlan);

  if (status === 'Archiving') {
    return (
      <Link name={name} namespace={namespace}>
        {t('Archiving')}
      </Link>
    );
  } else if (status === 'Archived') {
    return (
      <Link name={name} namespace={namespace}>
        <ArchiveIcon /> {t('Archived')}
      </Link>
    );
  } else if (isBeingStarted && !isWarmPlan) {
    return (
      <Link name={name} namespace={namespace}>
        {t('Running - preparing for migration')}
      </Link>
    );
  } else if (isBeingStarted && isWarmPlan) {
    return (
      <Link name={name} namespace={namespace}>
        {t('Running - preparing for incremental data copies')}
      </Link>
    );
  } else if (status === 'Unknown') {
    return <StatusIcon status="Warning" label="Unknown" />;
  } else if (status === 'NotStarted-Ready' || status === 'NotStarted-NotReady') {
    return <StatusCondition status={object.status} />;
  } else if (status === 'Copying' || status === 'Copying-CutoverScheduled') {
    return (
      <Link name={name} namespace={namespace}>
        {t('Running - performing incremental data copies')}
      </Link>
    );
  } else if (status === 'StartingCutover') {
    return (
      <Link name={name} namespace={namespace}>
        {t('Running - preparing for cutover')}
      </Link>
    );
  } else {
    return (
      <Link name={name} namespace={namespace} isInline={false}>
        <Progress
          id={`progress_for_${name}_in_${namespace}`}
          title={title}
          value={vmCount ? (vmDone * 100) / vmCount : 0}
          label={t('{{vmDone}} of {{vmCount}} VMs migrated', { vmDone, vmCount })}
          valueText={t('{{vmDone}} of {{vmCount}} VMs migrated', { vmDone, vmCount })}
          variant={variant}
          measureLocation={ProgressMeasureLocation.top}
          size={ProgressSize.sm}
        />
      </Link>
    );
  }
};
StatusCell.displayName = 'StatusCell';

const Actions = ({ primaryAction, resourceData, currentNamespace }: CellProps) => {
  const isBeingStarted = resourceData.status === 'Starting';
  return (
    <Flex
      flex={{ default: 'flex_2' }}
      spaceItems={{ default: 'spaceItemsNone' }}
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'nowrap' }}
    >
      {primaryAction && (
        <FlexItem align={{ default: 'alignRight' }}>
          {primaryAction === 'ScheduledCutover' && (
            <ScheduledCutoverTime cutover={resourceData.latestMigration?.cutover} />
          )}
          {(primaryAction === 'Start' || primaryAction === 'Cutover') && (
            <MigrateOrCutoverButton
              plan={resourceData.object}
              buttonType={primaryAction}
              isBeingStarted={isBeingStarted}
            />
          )}
        </FlexItem>
      )}
      {(primaryAction || !isBeingStarted) && (
        <FlexItem align={{ default: 'alignRight' }}>
          <PlanActions
            resourceData={resourceData}
            namespace={currentNamespace}
            ignoreList={primaryAction && primaryAction !== 'MustGather' ? [primaryAction] : []}
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

const NameCell = ({ resourceData: e }: CellProps) => {
  return (
    <span className="forklift-table__flex-cell">
      <Ref gvk={e.gvk} name={e.name} namespace={e.namespace} />
      {e.type === 'Cold' && (
        <Label isCompact color="blue" className="forklift-table__flex-cell-label">
          {PLAN_TYPE.Cold.toLowerCase()}
        </Label>
      )}
      {e.type === 'Warm' && (
        <Label isCompact color="orange" className="forklift-table__flex-cell-label">
          {PLAN_TYPE.Warm.toLowerCase()}
        </Label>
      )}
    </span>
  );
};
NameCell.displayName = 'NameCell';

const cellCreator: Record<string, (props: CellProps) => JSX.Element> = {
  [C.NAME]: NameCell,
  [C.SOURCE]: ({ resourceData: e }: CellProps) => (
    <Ref gvk={e.sourceGvk} name={e.source} namespace={e.namespace} />
  ),
  [C.TARGET]: ({ resourceData: e }: CellProps) => (
    <Ref gvk={e.targetGvk} name={e.target} namespace={e.namespace} />
  ),
  [C.NAMESPACE]: ({ value }: CellProps) => <ResourceLink kind="Namespace" name={value} />,
  [C.STATUS]: StatusCell,
  [C.ACTIONS]: Actions,
  [C.VM_COUNT]: ({ value, resourceData }: CellProps) => (
    <RouterLink to={`${PATH_PREFIX}/plans/ns/${resourceData.namespace}/${resourceData.name}`}>
      <VirtualMachineIcon /> {value}
    </RouterLink>
  ),
};

const PlanRow = ({
  resourceFields,
  resourceData,
  namespace: currentNamespace,
}: RowProps<FlatPlan>) => {
  const primaryAction = getPrimaryActionFromPlanState(resourceData.status);
  return (
    <Tr ouiaId={undefined} ouiaSafe={undefined}>
      {resourceFields.map(({ resourceFieldId, label }) => {
        const Cell = cellCreator[resourceFieldId] ?? TextCell;
        return resourceFieldId === C.DESCRIPTION ? (
          [
            <Td key={`${C.DESCRIPTION}_large`} visibility={['hidden', 'visibleOnMd']} width={20}>
              <Truncate content={resourceData.description ?? ''} />
            </Td>,
            <Td dataLabel={label} key={`${C.DESCRIPTION}_small`} visibility={['hiddenOnMd']}>
              {resourceData.description ?? ''}
            </Td>,
          ]
        ) : (
          <Td key={resourceFieldId} dataLabel={label}>
            <Cell
              value={String(
                getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? '',
              )}
              resourceData={resourceData}
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

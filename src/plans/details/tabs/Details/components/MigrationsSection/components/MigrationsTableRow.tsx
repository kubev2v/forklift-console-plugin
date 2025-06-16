import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import {
  getMigrationVMsStatusCounts,
  getPlanStatus,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Split } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';

import { getMigrationStatusLabel } from './utils/utils';

const MigrationsTableRow = ({
  migration,
  plan: planProp,
  showPlanColumn = false,
}: {
  migration: V1beta1Migration;
  plan?: V1beta1Plan;
  showPlanColumn?: boolean;
}) => {
  const planName = migration?.spec?.plan?.name;
  const planNamespace = migration?.spec?.plan?.namespace;
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>(
    planProp
      ? null
      : {
          groupVersionKind: PlanModelGroupVersionKind,
          name: planName,
          namespace: planNamespace,
          namespaced: true,
        },
  );
  const planStatus = getPlanStatus(planProp ?? plan);
  const migrationVMs = migration?.status?.vms;
  const vmStatuses = getMigrationVMsStatusCounts(
    migrationVMs ?? [],
    migrationVMs?.length ?? 0,
    planStatus,
  );
  return (
    <Tr key={getUID(migration)}>
      <Td>
        <ResourceLink
          groupVersionKind={MigrationModelGroupVersionKind}
          name={getName(migration)}
          namespace={getNamespace(migration)}
        />
      </Td>
      <Td>
        <Split hasGutter>
          {getMigrationStatusLabel(vmStatuses, migrationVMs?.length)}
          <ModalHOC>
            <VMStatusIconsRow statuses={vmStatuses} plan={planProp ?? plan} />
          </ModalHOC>
        </Split>
      </Td>
      {showPlanColumn && (
        <Td>
          <ResourceLink
            groupVersionKind={PlanModelGroupVersionKind}
            name={getName(planProp ?? plan)}
            namespace={getNamespace(planProp ?? plan)}
          />
        </Td>
      )}
      <Td modifier='fitContent'>
        <ConsoleTimestamp timestamp={migration?.status?.started ?? null} />
      </Td>
      <Td modifier='fitContent'>
        <ConsoleTimestamp timestamp={migration?.status?.completed ?? null} />
      </Td>
    </Tr>
  );
};

export default MigrationsTableRow;

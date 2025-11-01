import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { getMigrationStatusLabel } from 'src/plans/details/tabs/Details/components/MigrationsSection/components/utils/utils';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { Split } from '@patternfly/react-core';
import { Tr } from '@patternfly/react-table';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';

type MigrationRowProps = RowProps<V1beta1Migration> & {
  plans: V1beta1Plan[];
};

const MigrationRow: FC<MigrationRowProps> = ({
  plans,
  resourceData: migration,
  resourceFields,
}) => {
  const plan = plans.find((pl) => {
    return (
      getUID(pl) === migration.spec?.plan?.uid ||
      (getName(pl) === migration.spec?.plan?.name &&
        getNamespace(pl) === migration.spec?.plan?.namespace)
    );
  });
  const migrationVMs = migration?.status?.vms;
  const vmStatuses = getMigrationVMsStatusCounts(migrationVMs ?? [], migrationVMs?.length ?? 0);
  const rowFields = {
    completed: <ConsoleTimestamp timestamp={migration.status?.completed ?? ''} />,
    name: (
      <TableLinkCell
        groupVersionKind={MigrationModelGroupVersionKind}
        name={getName(migration)}
        namespace={getNamespace(migration)}
      />
    ),
    plan: (
      <TableLinkCell
        groupVersionKind={PlanModelGroupVersionKind}
        name={migration.spec?.plan?.name}
        namespace={migration.spec?.plan?.namespace}
      />
    ),
    started: <ConsoleTimestamp timestamp={migration.status?.started ?? ''} />,
    vms: (
      <Split hasGutter>
        {getMigrationStatusLabel(vmStatuses, migrationVMs?.length)}
        {plan ? <VMStatusIconsRow statuses={vmStatuses} plan={plan} /> : null}
      </Split>
    ),
  };
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          key={resourceFieldId}
          fieldId={resourceFieldId!}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as keyof typeof rowFields]}
        </VisibleTableData>
      ))}
    </Tr>
  );
};

export default MigrationRow;

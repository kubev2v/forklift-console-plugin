import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';
import VisibleTableData from 'src/modules/Providers/utils/components/TableCell/VisibleTableData';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import {
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
} from '@kubev2v/types';
import { Tr } from '@patternfly/react-table';

import { PlanTableResourceId } from '../../utils/constants';
import PlanActions from '../RowCells/PlanActions/PlanActions';
import PlanMigrationType from '../RowCells/PlanMigrationType/PlanMigrationType';
import PlanStatus from '../RowCells/PlanStatus/PlanStatus';
import PlanVirtualMachines from '../RowCells/PlanVirtualMachines/PlanVirtualMachines';

const PlanRow: FC<RowProps<V1beta1Plan>> = ({ resourceData: plan, resourceFields }) => {
  const planNamespace = plan?.metadata?.namespace;
  const planName = plan?.metadata?.name;
  const { name: destinationProviderName, namespace: destinationProviderNamespace } =
    plan?.spec?.provider?.destination ?? {};
  const { name: sourceProviderName, namespace: sourceProviderNamespace } =
    plan?.spec?.provider?.source ?? {};
  return (
    <Tr>
      <VisibleTableData fieldId={PlanTableResourceId.Name} resourceFields={resourceFields}>
        <TableLinkCell
          groupVersionKind={PlanModelGroupVersionKind}
          name={planName!}
          namespace={planNamespace!}
        />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Namespace} resourceFields={resourceFields}>
        <TableLinkCell
          groupVersionKind={{ kind: 'Namespace', version: 'v1' }}
          name={planNamespace!}
          namespace={planNamespace!}
        />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Source} resourceFields={resourceFields}>
        <TableLinkCell
          groupVersionKind={ProviderModelGroupVersionKind}
          name={sourceProviderName!}
          namespace={sourceProviderNamespace!}
        />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Destination} resourceFields={resourceFields}>
        <TableLinkCell
          groupVersionKind={ProviderModelGroupVersionKind}
          name={destinationProviderName!}
          namespace={destinationProviderNamespace!}
        />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Vms} resourceFields={resourceFields}>
        <PlanVirtualMachines plan={plan} />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Phase} resourceFields={resourceFields}>
        <PlanStatus plan={plan} />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.MigrationType} resourceFields={resourceFields}>
        <PlanMigrationType plan={plan} />
      </VisibleTableData>

      <VisibleTableData
        fieldId={PlanTableResourceId.MigrationStarted}
        resourceFields={resourceFields}
      >
        <ConsoleTimestamp timestamp={plan?.status?.migration?.started ?? ''} />
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Description} resourceFields={resourceFields}>
        <TableCell>{plan?.spec?.description}</TableCell>
      </VisibleTableData>

      <VisibleTableData fieldId={PlanTableResourceId.Actions} resourceFields={resourceFields}>
        <PlanActions plan={plan} />
      </VisibleTableData>
    </Tr>
  );
};

export default PlanRow;

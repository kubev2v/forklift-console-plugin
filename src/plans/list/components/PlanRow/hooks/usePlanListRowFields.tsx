import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';
import { TableLinkCell } from 'src/components/TableCell/TableLinkCell';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { PlanTableResourceId } from 'src/plans/list/utils/constants';
import { getProviderTypeIcon } from 'src/utils/providers/getProviderTypeIcon';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import ProviderIconLink from '@components/ProviderIconLink';
import {
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
} from '@kubev2v/types';
import { Truncate } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import {
  getPlanDescription,
  getPlanMigrationStarted,
  getPlanSourceProvider,
  getPlanTargetNamespace,
} from '@utils/crds/plans/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';
import { isEmpty } from '@utils/helpers';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';

import PlanActions from '../../PlanRowFields/PlanActions/PlanActions';
import PlanMigrationType from '../../PlanRowFields/PlanMigrationType/PlanMigrationType';
import PlanStatus from '../../PlanRowFields/PlanStatus/PlanStatus';
import PlanVirtualMachines from '../../PlanRowFields/PlanVirtualMachines/PlanVirtualMachines';

export const usePlanListRowFields = (plan: V1beta1Plan) => {
  const { sourceProvider } = usePlanSourceProvider(plan);
  const sourceProviderType = sourceProvider?.spec?.type;
  const planNamespace = getNamespace(plan);
  const planName = getName(plan);
  const planDescription = getPlanDescription(plan);
  const { name: sourceProviderName, namespace: sourceProviderNamespace } =
    getPlanSourceProvider(plan);
  const isDarkTheme = useIsDarkTheme();

  return {
    [PlanTableResourceId.Actions]: <PlanActions plan={plan} />,
    [PlanTableResourceId.Archived]: null,
    [PlanTableResourceId.Description]: isEmpty(planDescription) ? (
      <TableEmptyCell />
    ) : (
      <TableCell>
        <Truncate content={planDescription!} />
      </TableCell>
    ),
    [PlanTableResourceId.Destination]: (
      <TableLinkCell
        groupVersionKind={{ kind: 'Project', version: 'v1' }}
        name={getPlanTargetNamespace(plan)}
        namespace={getPlanTargetNamespace(plan)}
      />
    ),
    [PlanTableResourceId.MigrationStarted]: (
      <ConsoleTimestamp timestamp={getPlanMigrationStarted(plan)} />
    ),
    [PlanTableResourceId.MigrationType]: <PlanMigrationType plan={plan} />,
    [PlanTableResourceId.Name]: (
      <TableLinkCell
        groupVersionKind={PlanModelGroupVersionKind}
        name={planName}
        namespace={planNamespace}
      />
    ),
    [PlanTableResourceId.Namespace]: (
      <TableLinkCell
        groupVersionKind={{ kind: 'Project', version: 'v1' }}
        name={planNamespace}
        namespace={planNamespace}
      />
    ),
    [PlanTableResourceId.Phase]: <PlanStatus plan={plan} />,
    [PlanTableResourceId.Source]: (
      <ProviderIconLink
        href={getResourceUrl({
          groupVersionKind: ProviderModelGroupVersionKind,
          name: sourceProviderName,
          namespace: sourceProviderNamespace,
        })}
        providerIcon={getProviderTypeIcon(sourceProviderType, isDarkTheme)}
        providerName={sourceProviderName}
      />
    ),
    [PlanTableResourceId.Vms]: <PlanVirtualMachines plan={plan} />,
  };
};

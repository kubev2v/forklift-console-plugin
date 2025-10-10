import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { PROVIDER_DEFAULTS } from './utils/constants';
import { getNetworkName } from './utils/utils';
import EditPlanTransferNetwork from './EditPlanTransferNetwork';

const TransferNetworkDetailItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const networkName = getNetworkName(getPlanTransferNetwork(plan)!);

  return (
    <DetailsItem
      title={t('Transfer network')}
      content={
        networkName === PROVIDER_DEFAULTS ? (
          <Label isCompact color="grey">
            {PROVIDER_DEFAULTS}
          </Label>
        ) : (
          networkName
        )
      }
      helpContent={t(
        `You can change the migration transfer network for this plan.
        If you defined a migration transfer network for the OpenShift Virtualization provider
        and if the network is in the target namespace, the network that you defined is the default
        network for all migration plans. Otherwise, the pod network is used.`,
      )}
      crumbs={['spec', 'transferNetwork']}
      onEdit={() => {
        showModal(<EditPlanTransferNetwork resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TransferNetworkDetailItem;

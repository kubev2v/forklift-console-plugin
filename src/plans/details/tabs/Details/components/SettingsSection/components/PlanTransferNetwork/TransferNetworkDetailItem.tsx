import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1PlanSpecTransferNetwork } from '@kubev2v/types';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';

import type { SettingsDetailsItemProps } from '../../utils/types';

import { PROVIDER_DEFAULTS } from './utils/constants';
import EditPlanTransferNetwork from './EditPlanTransferNetwork';

const TransferNetworkDetailItem: FC<SettingsDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const transferNetworkToName = (network: V1beta1PlanSpecTransferNetwork | undefined) =>
    network && `${network.namespace}/${network.name}`;

  return (
    <DetailsItem
      title={t('Transfer Network')}
      content={
        transferNetworkToName(getPlanTransferNetwork(plan)) ?? (
          <span className="text-muted">{PROVIDER_DEFAULTS}</span>
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

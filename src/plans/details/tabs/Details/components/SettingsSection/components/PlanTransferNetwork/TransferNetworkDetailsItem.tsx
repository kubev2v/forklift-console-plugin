import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';
import type { EditPlanProps } from '../../utils/types';

import { PROVIDER_DEFAULTS } from './utils/constants';
import { getNetworkName } from './utils/utils';
import EditPlanTransferNetwork from './EditPlanTransferNetwork';

const TransferNetworkDetailItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const networkName = getNetworkName(getPlanTransferNetwork(plan) ?? null);

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={
        networkName === PROVIDER_DEFAULTS ? (
          <Label color="grey" isCompact>
            {PROVIDER_DEFAULTS}
          </Label>
        ) : (
          networkName
        )
      }
      crumbs={['spec', 'transferNetwork']}
      helpContent={t(
        `You can change the migration transfer network for this plan.
        If you defined a migration transfer network for the OpenShift Virtualization provider
        and if the network is in the target namespace, the network that you defined is the default
        network for all migration plans. Otherwise, the pod network is used.`,
      )}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditPlanTransferNetwork, { resource: plan });
      }}
      title={t('Transfer network')}
    />
  );
};

export default TransferNetworkDetailItem;

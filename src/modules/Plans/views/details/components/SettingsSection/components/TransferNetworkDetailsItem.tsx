import React from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1PlanSpecTransferNetwork } from '@kubev2v/types';

import type { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanTransferNetwork } from '../modals/EditPlanTransferNetwork';

export const TransferNetworkDetailsItem: React.FC<PlanDetailsItemProps> = ({
  canPatch,
  destinationProvider,
  helpContent,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `You can change the migration transfer network for this plan.
    If you defined a migration transfer network for the OpenShift Virtualization provider
    and if the network is in the target namespace, the network that you defined is the default
    network for all migration plans. Otherwise, the pod network is used.`,
  );

  const TransferNetworkToName = (n: V1beta1PlanSpecTransferNetwork) =>
    n && `${n.namespace}/${n.name}`;

  const content = TransferNetworkToName(resource?.spec?.transferNetwork);

  return (
    <DetailsItem
      title={t('Transfer Network')}
      content={content || <span className="text-muted">{t('Providers default')}</span>}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'transferNetwork ']}
      onEdit={
        canPatch &&
        isPlanEditable(resource) &&
        (() => {
          showModal(
            <EditPlanTransferNetwork
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          );
        })
      }
    />
  );
};

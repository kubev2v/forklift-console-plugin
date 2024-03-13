import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1PlanSpecTransferNetwork } from '@kubev2v/types';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanTransferNetwork } from '../modals/EditPlanTransferNetwork';

export const TransferNetworkDetailsItem: React.FC<PlanDetailsItemProps> = ({
  resource,
  canPatch,
  helpContent,
  destinationProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `The network attachment definition that should be used for disk transfer.`,
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
        (() =>
          showModal(
            <EditPlanTransferNetwork
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          ))
      }
    />
  );
};
import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanTransferNetwork } from '../modals/EditPlanTransferNetwork';

export const TransferNetworkDetailsItem: React.FC<PlanDetailsItemProps> = ({
  resource: provider,
  canPatch,
  helpContent,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `The network attachment definition that should be used for disk transfer.`,
  );

  return (
    <DetailsItem
      title={t('Transfer Network')}
      content={
        provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'] || (
          <span className="text-muted">{t('Providers default')}</span>
        )
      }
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'transferNetwork ']}
      onEdit={canPatch && (() => showModal(<EditPlanTransferNetwork resource={provider} />))}
    />
  );
};

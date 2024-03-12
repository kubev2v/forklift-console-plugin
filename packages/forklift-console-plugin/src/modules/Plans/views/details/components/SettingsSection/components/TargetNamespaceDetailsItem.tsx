import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanTargetNamespace } from '../modals';

export const TargetNamespaceDetailsItem: React.FC<PlanDetailsItemProps> = ({
  resource,
  canPatch,
  helpContent,
  destinationProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t('Target namespace.');
  return (
    <DetailsItem
      title={t('Target namespace')}
      content={
        resource?.spec?.targetNamespace || (
          <span className="text-muted">{t('Providers default')}</span>
        )
      }
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'targetNamespace ']}
      onEdit={
        canPatch &&
        (() =>
          showModal(
            <EditPlanTargetNamespace
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          ))
      }
    />
  );
};

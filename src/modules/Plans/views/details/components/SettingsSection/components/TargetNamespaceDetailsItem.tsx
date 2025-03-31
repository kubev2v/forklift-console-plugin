import React from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanTargetNamespace } from '../modals';

export const TargetNamespaceDetailsItem: React.FC<PlanDetailsItemProps> = ({
  canPatch,
  destinationProvider,
  helpContent,
  resource,
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
        isPlanEditable(resource) &&
        (() => {
          showModal(
            <EditPlanTargetNamespace
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          );
        })
      }
    />
  );
};

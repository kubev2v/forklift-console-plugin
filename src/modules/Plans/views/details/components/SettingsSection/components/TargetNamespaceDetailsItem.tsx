import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { PlanDetailsItemProps } from '../../DetailsSection/components/PlanDetailsItemProps';
import { EditPlanTargetNamespace } from '../modals/EditPlanTargetNamespace/EditPlanTargetNamespace';

export const TargetNamespaceDetailsItem: FC<PlanDetailsItemProps> = ({
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

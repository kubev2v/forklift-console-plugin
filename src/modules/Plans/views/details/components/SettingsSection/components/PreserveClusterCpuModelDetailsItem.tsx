import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { PlanDetailsItemProps } from '../../DetailsSection/components/PlanDetailsItemProps';
import { EditPlanPreserveClusterCpuModel } from '../modals/EditPlanPreserveClusterCpuModel/EditPlanPreserveClusterCpuModel';

export const PreserveClusterCpuModelDetailsItem: FC<PlanDetailsItemProps> = ({
  canPatch,
  destinationProvider,
  helpContent,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `Preserve the CPU model and flags the VM runs with in its oVirt cluster.`,
  );

  const trueLabel = (
    <Label isCompact color={'green'}>
      Preserve CPU model
    </Label>
  );
  const falseLabel = (
    <Label isCompact color={'blue'}>
      Use system default
    </Label>
  );

  return (
    <DetailsItem
      title={t('Preserve CPU model')}
      content={resource?.spec?.preserveClusterCpuModel ? trueLabel : falseLabel}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'preserveClusterCpuModel']}
      onEdit={
        canPatch &&
        isPlanEditable(resource) &&
        (() => {
          showModal(
            <EditPlanPreserveClusterCpuModel
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          );
        })
      }
    />
  );
};

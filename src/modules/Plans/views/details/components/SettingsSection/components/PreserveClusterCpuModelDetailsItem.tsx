import React from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanPreserveClusterCpuModel } from '../modals';

export const PreserveClusterCpuModelDetailsItem: React.FC<PlanDetailsItemProps> = ({
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

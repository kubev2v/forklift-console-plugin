import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanPreserveStaticIPs } from '../modals/EditPlanPreserveStaticIPs';

export const PreserveStaticIPsDetailsItem: React.FC<PlanDetailsItemProps> = ({
  resource,
  canPatch,
  helpContent,
  destinationProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `Preserve the static IPs of VMs with Windows guest operating system from vSphere.`,
  );

  const trueLabel = (
    <Label isCompact color={'green'}>
      Preserve static IPs
    </Label>
  );
  const falseLabel = (
    <Label isCompact color={'blue'}>
      Use system default
    </Label>
  );

  return (
    <DetailsItem
      title={t('Preserve static IPs')}
      content={resource?.spec?.preserveStaticIPs ? trueLabel : falseLabel}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'preserveStaticIPs']}
      onEdit={
        canPatch &&
        (() =>
          showModal(
            <EditPlanPreserveStaticIPs
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          ))
      }
    />
  );
};

import React from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { PlanDetailsItemProps } from '../../DetailsSection';
import { EditPlanPreserveStaticIPs } from '../modals/EditPlanPreserveStaticIPs';

export const PreserveStaticIPsDetailsItem: React.FC<PlanDetailsItemProps> = ({
  canPatch,
  destinationProvider,
  helpContent,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(
    `Preserve the static IPs of virtual machines migrated from vSphere.`,
  );

  const trueLabel = (
    <Label isCompact color={'green'}>
      {t('Preserve static IPs')}
    </Label>
  );
  const falseLabel = (
    <Label isCompact color={'blue'}>
      {t('Do not preserve static IPs')}
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
        isPlanEditable(resource) &&
        (() => {
          showModal(
            <EditPlanPreserveStaticIPs
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          );
        })
      }
    />
  );
};

import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { PlanDetailsItemProps } from '../../DetailsSection/components/PlanDetailsItemProps';
import { EditPlanWarm } from '../modals/EditPlanWarm/EditPlanWarm';

export const WarmDetailsItem: FC<PlanDetailsItemProps> = ({
  canPatch,
  destinationProvider,
  helpContent,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t('Whether this is a warm migration.');

  const WarmLabel = (
    <Label isCompact color={'orange'}>
      warm
    </Label>
  );
  const ColdLabel = (
    <Label isCompact color={'blue'}>
      cold
    </Label>
  );

  return (
    <DetailsItem
      title={t('Migration type')}
      content={resource?.spec?.warm ? WarmLabel : ColdLabel}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['spec', 'warm ']}
      onEdit={
        canPatch &&
        isPlanEditable(resource) &&
        (() => {
          showModal(<EditPlanWarm resource={resource} destinationProvider={destinationProvider} />);
        })
      }
    />
  );
};

import React, { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanDetailsItemProps } from '../../../DetailsSection';
import { EnhancedPlan } from '../../utils/types';

import NetworkNameTemplateModal from './NetworkNameTemplateModal';

const NetworkNameTemplateDetailsItem: FC<PlanDetailsItemProps> = ({ resource, canPatch }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const plan = resource as EnhancedPlan;

  const content = plan?.spec?.networkNameTemplate
    ? t('Use custom network name template')
    : t('Use default network name template');

  const title = t('Network name template');
  const pathArray = ['spec', 'networkNameTemplate'];

  return (
    <DetailsItem
      title={title}
      content={content}
      crumbs={pathArray}
      onEdit={() => {
        if (canPatch && isPlanEditable(resource)) {
          showModal(<NetworkNameTemplateModal resource={resource} jsonPath={pathArray} />);
        }
      }}
    />
  );
};

export default NetworkNameTemplateDetailsItem;

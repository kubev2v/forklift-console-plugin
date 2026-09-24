import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import {
  getNameTemplateOverrideVms,
  NAME_TEMPLATE_TYPE,
  removeVmNameTemplateFromAllVms,
} from 'src/plans/details/utils/nameTemplateOverrides';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';
import NameTemplateDetailsValue from '../NameTemplateOverride/NameTemplateDetailsValue';

import { onConfirmVolumeNameTemplate } from './utils/utils';
import EditVolumeNameTemplate, { type EditVolumeNameTemplateProps } from './EditVolumeNameTemplate';

const VolumeNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const planEditable = isPlanEditable(plan);
  const vmNames = planEditable ? getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.volume) : [];

  return (
    <DetailsItem
      canEdit={canPatch && planEditable}
      content={
        <NameTemplateDetailsValue
          canApply={canPatch && planEditable}
          isPlanCustom={Boolean(plan?.spec?.volumeNameTemplate)}
          onApply={async () => removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.volume)}
          templateType={NAME_TEMPLATE_TYPE.volume}
          vmNames={vmNames}
        />
      }
      crumbs={['spec', 'volumeNameTemplate']}
      onEdit={() => {
        launchOverlay<EditVolumeNameTemplateProps>(EditVolumeNameTemplate, {
          allowInherit: false,
          onConfirmVolumeNameTemplate,
          resource: plan,
          value: plan?.spec?.volumeNameTemplate,
        });
      }}
      title={t('Volume name template')}
    />
  );
};

export default VolumeNameTemplateDetailsItem;

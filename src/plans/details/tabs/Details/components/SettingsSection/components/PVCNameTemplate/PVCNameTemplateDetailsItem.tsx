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

import { onConfirmPVCNameTemplate } from './utils/utils';
import EditPVCNameTemplate, { type EditPVCNameTemplateProps } from './EditPVCNameTemplate';

const PVCNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
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
  const vmNames = planEditable ? getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc) : [];

  return (
    <DetailsItem
      canEdit={canPatch && planEditable}
      content={
        <NameTemplateDetailsValue
          canApply={canPatch && planEditable}
          isPlanCustom={Boolean(plan?.spec?.pvcNameTemplate)}
          onApply={async () => removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.pvc)}
          templateType={NAME_TEMPLATE_TYPE.pvc}
          vmNames={vmNames}
        />
      }
      crumbs={['spec', 'pvcNameTemplate']}
      onEdit={() => {
        launchOverlay<EditPVCNameTemplateProps>(EditPVCNameTemplate, {
          allowInherit: false,
          onConfirmPVCNameTemplate,
          resource: plan,
          value: plan?.spec?.pvcNameTemplate,
        });
      }}
      title={t('PVC name template')}
    />
  );
};

export default PVCNameTemplateDetailsItem;

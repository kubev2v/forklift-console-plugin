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

import { onConfirmPlanNetworkNameTemplate } from './utils/utils';
import EditNetworkNameTemplate, {
  type EditNetworkNameTemplateProps,
} from './EditNetworkNameTemplate';

const NetworkNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
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
  const vmNames = planEditable ? getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.network) : [];

  return (
    <DetailsItem
      canEdit={canPatch && planEditable}
      content={
        <NameTemplateDetailsValue
          canApply={canPatch && planEditable}
          isPlanCustom={Boolean(plan?.spec?.networkNameTemplate)}
          onApply={async () => removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.network)}
          templateType={NAME_TEMPLATE_TYPE.network}
          vmNames={vmNames}
        />
      }
      crumbs={['spec', 'networkNameTemplate']}
      onEdit={() => {
        launchOverlay<EditNetworkNameTemplateProps>(EditNetworkNameTemplate, {
          allowInherit: false,
          onConfirmNetworkNameTemplate: onConfirmPlanNetworkNameTemplate,
          resource: plan,
          value: plan?.spec?.networkNameTemplate,
        });
      }}
      title={t('Network name template')}
    />
  );
};

export default NetworkNameTemplateDetailsItem;

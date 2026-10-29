import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type ProviderType, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import EditVmWizard, { type EditVmWizardProps } from './edit-vm-wizard/EditVmWizard';

type SpecVirtualMachinesActionsDropdownItemsProps = {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  vmIndex: number;
};

const SpecVirtualMachinesActionsDropdownItems: FC<SpecVirtualMachinesActionsDropdownItemsProps> = ({
  plan,
  providerType,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });
  const canEdit = canPatch && isPlanEditable(plan);

  return (
    <DropdownList>
      <DropdownItem
        data-testid="edit-vm-menu-item"
        isDisabled={!canEdit}
        key="edit-vm"
        onClick={() => {
          launchOverlay<EditVmWizardProps>(EditVmWizard, {
            plan,
            providerType,
            vmIndex,
          });
        }}
      >
        {t('Edit VM')}
      </DropdownItem>
    </DropdownList>
  );
};

export default SpecVirtualMachinesActionsDropdownItems;

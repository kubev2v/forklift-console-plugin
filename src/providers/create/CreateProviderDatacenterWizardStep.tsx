import type { ReactElement } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { Alert, AlertVariant, Form, WizardStep } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import DatacenterSelect from '../components/vsphere/DatacenterSelect';

import type { CreateProviderPlacement } from './hooks/createProviderPlacement.types';
import type { CreateProviderDatacenter } from './hooks/useCreateProviderDatacenter';
import { PROVIDER_PLACEMENT_STEP_ID } from './utils/wizardConstants';
import CreateProviderPlacementInventory from './CreateProviderPlacementInventory';
import CreateProviderPlacementLoading from './CreateProviderPlacementLoading';
import CreateProviderPlacementStep from './CreateProviderPlacementStep';

type CreateProviderDatacenterWizardStepProps = {
  apiError: Error | null;
  canCreateCopyApplianceTemplate: boolean;
  createdProvider: V1beta1Provider | undefined;
  datacenter: CreateProviderDatacenter;
  isApplianceSelected: boolean;
  isVisible: boolean;
  placement: CreateProviderPlacement;
};

export const createProviderDatacenterWizardStep = ({
  apiError,
  canCreateCopyApplianceTemplate,
  createdProvider,
  datacenter,
  isApplianceSelected,
  isVisible,
  placement,
}: CreateProviderDatacenterWizardStepProps): ReactElement => {
  const isInventoryLoading =
    isApplianceSelected && (datacenter.isInventoryLoading || placement.options.inventoryLoading);
  const datacenterField = (
    <Form className="create-provider-form">
      <DatacenterSelect
        error={datacenter.error?.message}
        includeAllDatacenters={!isApplianceSelected}
        isDisabled={datacenter.isPending || datacenter.isInventoryLoading}
        isRequired={isApplianceSelected}
        names={datacenter.names}
        onChange={datacenter.onSelect}
        value={datacenter.value}
      />
      {datacenter.inventoryError && (
        <Alert
          isInline
          title={t('Could not load the datacenter list')}
          variant={AlertVariant.warning}
        >
          {isApplianceSelected && t('Cannot continue until the datacenter list is available.')}
        </Alert>
      )}
    </Form>
  );

  return (
    <WizardStep
      id={PROVIDER_PLACEMENT_STEP_ID}
      isDisabled={!createdProvider}
      isHidden={!isVisible}
      name={isApplianceSelected ? t('Sourcing appliance') : t('Datacenter')}
    >
      {createdProvider && (
        <>
          {isApplianceSelected && !canCreateCopyApplianceTemplate && (
            <Alert
              isInline
              title={t('You do not have permission to create a copy appliance template.')}
              variant={AlertVariant.danger}
            />
          )}
          <CreateProviderPlacementStep isAppliance={isApplianceSelected} placement={placement}>
            {isApplianceSelected &&
              (isInventoryLoading ? (
                <CreateProviderPlacementLoading label={t('Loading vSphere placement inventory')} />
              ) : (
                <CreateProviderPlacementInventory
                  leadingField={datacenterField}
                  placement={placement}
                />
              ))}
            {!isApplianceSelected && datacenterField}
          </CreateProviderPlacementStep>
          {apiError && isApplianceSelected && (
            <Alert
              isInline
              title={t('Error deploying sourcing appliance')}
              variant={AlertVariant.danger}
            >
              {apiError.message}
            </Alert>
          )}
        </>
      )}
    </WizardStep>
  );
};

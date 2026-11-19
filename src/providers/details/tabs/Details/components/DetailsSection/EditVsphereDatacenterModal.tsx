import { useState } from 'react';
import DatacenterSelect from 'src/providers/components/vsphere/DatacenterSelect';
import { isProviderUsingCopyAppliance } from 'src/providers/utils/isProviderUsingCopyAppliance';
import { buildProviderSettingPatch } from 'src/providers/utils/settings/buildProviderSettingPatch';
import {
  getDatacenterNames,
  isCopyApplianceFolderWithinDatacenter,
} from 'src/providers/utils/vsphere/datacenter';
import { getVSphereDatacenter } from 'src/utils/crds/common/selectors';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Form,
  ModalVariant,
  Stack,
} from '@patternfly/react-core';
import { getCopyApplianceFolder } from '@utils/crds/providers/selectors';
import { isEmpty } from '@utils/helpers';
import useProviderInventory from '@utils/hooks/useProviderInventory';

import { COPY_APPLIANCE_SETTING_KEY } from './copyAppliancePlacementConfig';

export type EditVsphereDatacenterModalProps = {
  resource: V1beta1Provider;
};

const DATACENTER_SETTING_KEY = 'datacenter';

const EditVsphereDatacenterModal: OverlayComponent<EditVsphereDatacenterModalProps> = ({
  closeOverlay,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState(getVSphereDatacenter(provider) ?? '');
  const [resetPlacement, setResetPlacement] = useState(true);

  const { error, forceRefresh, inventory } = useProviderInventory<
    { id: string; name: string; path?: string }[]
  >({
    provider,
    subPath: 'datacenters?detail=1',
  });

  const names = getDatacenterNames(inventory);
  const requiresDatacenter = isProviderUsingCopyAppliance(provider);

  const datacenter = value.trim();
  const copyApplianceFolder = getCopyApplianceFolder(provider);
  const hasPlacementConflict =
    !isEmpty(copyApplianceFolder?.trim()) &&
    !isEmpty(datacenter) &&
    !isCopyApplianceFolderWithinDatacenter(copyApplianceFolder, datacenter);
  const isSaveDisabled =
    (hasPlacementConflict && !resetPlacement) || (requiresDatacenter && isEmpty(datacenter));

  const onConfirm = async (): Promise<void> => {
    const patches = buildProviderSettingPatch(provider, DATACENTER_SETTING_KEY, datacenter);

    if (hasPlacementConflict && resetPlacement) {
      patches.push(
        ...Object.values(COPY_APPLIANCE_SETTING_KEY).flatMap((key) =>
          buildProviderSettingPatch(provider, key, ''),
        ),
      );
    }

    if (!isEmpty(patches)) {
      await k8sPatch({ data: patches, model: ProviderModel, resource: provider });
    }
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={isSaveDisabled}
      onConfirm={onConfirm}
      title={t('Edit datacenter')}
      variant={ModalVariant.medium}
    >
      <Stack hasGutter>
        {t(
          'Changing the datacenter limits the provider inventory to the new datacenter. Plans that use virtual machines outside it might fail.',
        )}
        {requiresDatacenter && (
          <Alert
            isInline
            title={t('A datacenter is required when using a sourcing appliance')}
            variant={AlertVariant.info}
          />
        )}
        {error && (
          <Alert
            actionLinks={
              <Button onClick={forceRefresh} variant={ButtonVariant.link}>
                {t('Retry')}
              </Button>
            }
            isInline
            title={t('Could not load the datacenter list')}
            variant={AlertVariant.warning}
          >
            {t('Enter the datacenter name manually.')}
          </Alert>
        )}
        <Form>
          <DatacenterSelect
            includeAllDatacenters={!requiresDatacenter}
            isRequired={requiresDatacenter}
            names={names}
            onChange={(selected) => {
              if (requiresDatacenter && isEmpty(selected)) {
                return;
              }

              setValue(selected);
            }}
            value={value}
          />
        </Form>
        {hasPlacementConflict && (
          <>
            <Alert
              isInline
              title={t('Copy appliance placement is outside the selected datacenter')}
              variant={AlertVariant.warning}
            >
              {t(
                'The copy appliance folder is not under the selected datacenter. Placements using it can leave the provider in a not ready state.',
              )}
            </Alert>
            <Checkbox
              data-testid="reset-copy-appliance-placement-checkbox"
              id="reset-copy-appliance-placement"
              isChecked={resetPlacement}
              label={t('Also reset copy appliance placement settings')}
              onChange={(_event, checked) => {
                setResetPlacement(checked);
              }}
            />
          </>
        )}
      </Stack>
    </ModalForm>
  );
};

export default EditVsphereDatacenterModal;

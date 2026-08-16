import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1PlanSpecTransferNetwork } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack } from '@patternfly/react-core';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import usePlanDestinationProvider from '../../../hooks/usePlanDestinationProvider';
import type { EditPlanProps } from '../../utils/types';

import { onConfirmTransferNetwork } from './utils/utils';
import TransferNetworkDropdown from './TransferNetworkDropdown';

const EditPlanTransferNetwork: OverlayComponent<EditPlanProps> = ({ closeOverlay, resource }) => {
  const { t } = useForkliftTranslation();
  const { destinationProvider } = usePlanDestinationProvider(resource);
  const [value, setValue] = useState<V1beta1PlanSpecTransferNetwork | null>(
    getPlanTransferNetwork(resource) ?? null,
  );

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => onConfirmTransferNetwork({ newValue: value, resource })}
      title={t('Edit migration plan transfer network')}
    >
      <Stack hasGutter>
        {t(
          `You can select a migration network. If you do not select a migration network,
            the default migration network is set to the providers default transfer network.`,
        )}
        <FormGroupWithHelpText
          helperText={t('Please choose a NetworkAttachmentDefinition for data transfer.')}
          label={t('Transfer network')}
        >
          <TransferNetworkDropdown
            onChange={setValue}
            provider={destinationProvider}
            value={value}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditPlanTransferNetwork;

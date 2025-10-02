import { type FC, useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1PlanSpecTransferNetwork } from '@kubev2v/types';
import { Stack } from '@patternfly/react-core';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import usePlanDestinationProvider from '../../../hooks/usePlanDestinationProvider';
import type { EditPlanProps } from '../../utils/types';

import { onConfirmTransferNetwork } from './utils/utils';
import TransferNetworkDropdown from './TransferNetworkDropdown';

const EditPlanTransferNetwork: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const { destinationProvider } = usePlanDestinationProvider(resource);
  const [value, setValue] = useState<V1beta1PlanSpecTransferNetwork | null>(
    getPlanTransferNetwork(resource) ?? null,
  );

  return (
    <ModalForm
      title={t('Edit migration plan transfer network')}
      onConfirm={async () => onConfirmTransferNetwork({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(
          `You can select a migration network. If you do not select a migration network,
            the default migration network is set to the providers default transfer network.`,
        )}
        <FormGroupWithHelpText
          label={t('Transfer network')}
          helperText={t('Please choose a NetworkAttachmentDefinition for data transfer.')}
        >
          <TransferNetworkDropdown
            provider={destinationProvider}
            value={value}
            onChange={setValue}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditPlanTransferNetwork;

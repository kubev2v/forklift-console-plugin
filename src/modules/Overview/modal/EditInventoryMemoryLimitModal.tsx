import type { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type { ModalInputComponentType } from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import type { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { description: 'Low memory limit', key: '400Mi', name: '400Mi' },
  { description: 'Moderate memory limit', key: '1000Mi', name: '1000Mi' },
  { description: 'High memory limit', key: '2000Mi', name: '2000Mi' },
  { description: 'Very high memory limit', key: '8000Mi', name: '8000Mi' },
];

/**
 * InventoryMemoryLimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const InventoryMemoryLimitSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditInventoryMemoryLimitModal: FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.inventory_container_limits_memory'}
      title={props?.title || t('Edit Inventory Container Memory limit')}
      label={props?.label || t('Inventory Container Memory limit')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t(
        'The limit for memory usage by the inventory container, specified in Megabytes (Mi). Default value is 1000Mi.',
      )}
      helperText={t(
        'Please enter the limit for memory usage by the inventory container in Mi, if empty default value will be used.',
      )}
      InputComponent={InventoryMemoryLimitSelect}
    />
  );
};

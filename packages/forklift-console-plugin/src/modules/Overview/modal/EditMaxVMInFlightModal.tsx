import React from 'react';
import { EditModal, ModalInputComponentType } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { key: 2, name: 2, description: 'Very low concurrent VM migrations' },
  { key: 10, name: 10, description: 'Low concurrent VM migrations' },
  { key: 20, name: 20, description: 'Moderate concurrent VM migrations' },
  { key: 50, name: 50, description: 'High concurrent VM migrations' },
  { key: 100, name: 100, description: 'Very high concurrent VM migrations' },
];

/**
 * MaxVMInFlightSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const MaxVMInFlightSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditMaxVMInFlightModal: React.FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.controller_max_vm_inflight'}
      title={props?.title || t('Edit Maximum concurrent VM migrations')}
      label={props?.label || t('Maximum concurrent VM migrations')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t('Maximum number of concurrent VM migrations. Default value is 20.')}
      helperText={t(
        'Please enter the maximum number of concurrent VM migrations, if empty default value will be used.',
      )}
      InputComponent={MaxVMInFlightSelect}
    />
  );
};

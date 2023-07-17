import React from 'react';
import { EditModal, ModalInputComponentType } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { key: '200m', name: '200m', description: 'Low CPU limit' },
  { key: '500m', name: '500m', description: 'Moderate CPU limit' },
  { key: '2000m', name: '2000m', description: 'High CPU limit' },
  { key: '8000m', name: '8000m', description: 'Very high CPU limit' },
];

/**
 * ControllerCPULimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const ControllerCPULimitSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditControllerCPULimitModal: React.FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.controller_container_limits_cpu'}
      title={props?.title || t('Edit Controller CPU limit')}
      label={props?.label || t('Controller CPU limit')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t(
        'The limit for CPU usage by the controller, specified in milliCPU. Default value is 500m.',
      )}
      helperText={t(
        'Please enter the limit for CPU usage by the controller in milliCPU, if empty default value will be used.',
      )}
      InputComponent={ControllerCPULimitSelect}
    />
  );
};

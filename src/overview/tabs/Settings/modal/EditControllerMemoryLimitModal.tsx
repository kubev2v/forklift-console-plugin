import type { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type { ModalInputComponentType } from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import type { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { description: 'Low memory limit', key: '200Mi', name: '200Mi' },
  { description: 'Moderate memory limit', key: '800Mi', name: '800Mi' },
  { description: 'High memory limit', key: '2000Mi', name: '2000Mi' },
  { description: 'Very high memory limit', key: '8000Mi', name: '8000Mi' },
];

/**
 * ControllerMemoryLimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const ControllerMemoryLimitSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditControllerMemoryLimitModal: FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_container_limits_memory'}
      title={props?.title ?? t('Edit Controller Memory limit')}
      label={props?.label ?? t('Controller Memory limit')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t(
        'The limit for memory usage by the controller, specified in Megabytes (Mi). Default value is 800Mi.',
      )}
      helperText={t(
        'Please enter the limit for memory usage by the controller in Mi, if empty default value will be used.',
      )}
      InputComponent={ControllerMemoryLimitSelect}
    />
  );
};

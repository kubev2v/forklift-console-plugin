import React from 'react';
import { EditModal, ModalInputComponentType } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { key: '-1', name: 'Disable', description: 'Never perform must gather cleanup' },
  { key: '1h', name: '1h', description: 'Clean must gather API after 1 hour' },
  { key: '12h', name: '12h', description: 'Clean must gather API after 12 hours' },
  { key: '24h', name: '24h', description: 'Clean must gather API after 24 hours' },
  { key: '72h', name: '72h', description: 'Clean must gather API after 72 hours' },
];

/**
 * CleanupMaxAgeSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const CleanupMaxAgeSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditCleanupMaxAgeModal: React.FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.must_gather_api_cleanup_max_age'}
      title={props?.title || t('Edit Must gather cleanup after (hours)')}
      label={props?.label || t('Must gather cleanup after (hours)')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t(
        'The maximum age in hours for must gather cleanup. Default value is -1, which implies never.',
      )}
      helperText={t(
        'Please enter the maximum age in hours for must gather cleanup, if empty default value will be used.',
      )}
      InputComponent={CleanupMaxAgeSelect}
    />
  );
};

import React from 'react';
import { EditModal, ModalInputComponentType } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { key: 1, name: 1, description: 'Extra short snapshot polling interval' },
  { key: 5, name: 5, description: 'Short snapshot polling interval' },
  { key: 10, name: 10, description: 'Long snapshot polling interval' },
  { key: 50, name: 60, description: 'Extra long snapshot polling interval' },
];

/**
 * SnapshotPoolingIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const SnapshotPoolingIntervalSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditSnapshotPoolingIntervalModal: React.FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.controller_snapshot_status_check_rate_seconds'}
      title={props?.title || t('Edit Snapshot pooling interval (seconds)')}
      label={props?.label || t('Snapshot pooling interval (seconds)')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t('The interval in seconds for snapshot pooling. Default value is 10.')}
      helperText={t(
        'Please enter the interval in seconds for snapshot pooling, if empty default value will be used.',
      )}
      InputComponent={SnapshotPoolingIntervalSelect}
    />
  );
};

import type { FC } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type { ModalInputComponentType } from 'src/modules/Providers/modals/EditModal/types';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import type { EditSettingsModalProps } from './EditSettingsModalProps';
import SettingsSelectInput from './SettingsSelectInput';

// Define the options
const options = [
  { description: 'Extra small precopy interval', key: 5, name: '5min' },
  { description: 'Small precopy interval', key: 30, name: '30min' },
  { description: 'Large precopy interval', key: 60, name: '60min' },
  { description: 'Extra large precopy interval', key: 120, name: '120min' },
];

/**
 * PrecopyIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 *
 * @param {ModalInputComponentProps} props - Properties passed to the component
 * @returns {JSX.Element}
 */
const PrecopyIntervalSelect: ModalInputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

export const EditPreCopyIntervalModal: FC<EditSettingsModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={'spec.controller_precopy_interval'}
      title={props?.title || t('Edit Precopy interval (minutes)')}
      label={props?.label || t('Precopy interval (minutes)')}
      model={ForkliftControllerModel}
      variant={ModalVariant.small}
      body={t('The interval in minutes for precopy. Default value is 60.')}
      helperText={t(
        'Please enter the interval in minutes for precopy, if empty default value will be used.',
      )}
      InputComponent={PrecopyIntervalSelect}
      onConfirmHook={defaultOnConfirmWithIntValue}
    />
  );
};

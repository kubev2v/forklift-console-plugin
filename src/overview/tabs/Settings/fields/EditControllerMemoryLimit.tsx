import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Text } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
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
 */
const ControllerMemoryLimitSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

const EditControllerMemoryLimit: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_container_limits_memory'}
      label={
        <DisplayTitle
          title={t('Controller main container memory limit')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Text>
              {t(
                'Sets the memory limits allocated to the main container in the controller pod. The default value is 800Mi.',
              )}
            </Text>
          }
          crumbs={['spec', 'controller_container_limits_memory']}
        />
      }
      model={ForkliftControllerModel}
      helperText={t(
        'Enter the limit for memory usage by the controller in Mi. If empty, the default value will be used.',
      )}
      InputComponent={ControllerMemoryLimitSelect}
      defaultValue="800Mi"
    />
  );
};

export default EditControllerMemoryLimit;

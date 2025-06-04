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
  { description: 'Low CPU limit', key: '200m', name: '200m' },
  { description: 'Moderate CPU limit', key: '500m', name: '500m' },
  { description: 'High CPU limit', key: '2000m', name: '2000m' },
  { description: 'Very high CPU limit', key: '8000m', name: '8000m' },
];

/**
 * ControllerCPULimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const ControllerCPULimitSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

const EditControllerCPULimit: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { resource } = props;

  return (
    <EditField
      {...props}
      resource={resource as K8sResourceCommon}
      jsonPath={'spec.controller_container_limits_cpu'}
      label={
        <DisplayTitle
          title={t('Controller main container CPU limit')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Text>
              {t(
                'Defines the CPU limits allocated to the main container in the controller pod. The default value is 500 milliCPU.',
              )}
            </Text>
          }
          crumbs={['spec', 'controller_container_limits_cpu']}
        />
      }
      model={ForkliftControllerModel}
      helperText={t(
        'Enter the limit for CPU usage by the controller in milliCPU. If empty, the default value will be used.',
      )}
      InputComponent={ControllerCPULimitSelect}
      defaultValue="500m"
    />
  );
};

export default EditControllerCPULimit;

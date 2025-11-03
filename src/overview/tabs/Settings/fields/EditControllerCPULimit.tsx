import type { FC } from 'react';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
import { controllerCpuLimitOptions } from './options';
import SettingsSelectInput from './SettingsSelectInput';

/**
 * ControllerCPULimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const ControllerCPULimitSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={controllerCpuLimitOptions} />;
};

const EditControllerCPULimit: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { resource } = props;

  return (
    <EditField
      {...props}
      resource={resource as K8sResourceCommon}
      jsonPath={'spec.controller_container_limits_cpu'}
      label={t('Controller main container CPU limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller main container CPU limit')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Defines the CPU limits allocated to the main container in the controller pod. The default value is 500 milliCPU.',
              )}
            </StackItem>
            <StackItem>
              <a href={MTV_SETTINGS} target="_blank" rel="noreferrer">
                Learn more
              </a>
            </StackItem>
          </Stack>
        </HelpIconPopover>
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

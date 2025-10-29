import type { FC } from 'react';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
import { controllerMemoryLimitOptions } from './options';
import SettingsSelectInput from './SettingsSelectInput';

/**
 * ControllerMemoryLimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const ControllerMemoryLimitSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={controllerMemoryLimitOptions} />;
};

const EditControllerMemoryLimit: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_container_limits_memory'}
      label={t('Controller main container memory limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller main container memory limit')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Sets the memory limits allocated to the main container in the controller pod. The default value is 800Mi.',
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
        'Enter the limit for memory usage by the controller in Mi. If empty, the default value will be used.',
      )}
      InputComponent={ControllerMemoryLimitSelect}
      defaultValue="800Mi"
    />
  );
};

export default EditControllerMemoryLimit;

import type { FC } from 'react';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
import { preCopyIntervalOptions } from './options';
import SettingsSelectInput from './SettingsSelectInput';

/**
 * PrecopyIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const PrecopyIntervalSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={preCopyIntervalOptions} />;
};

const EditPreCopyInterval: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_precopy_interval'}
      label={t('Precopy interval')}
      labelHelp={
        <HelpIconPopover header={t('Precopy interval')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
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
        'Enter the interval in minutes for precopy. If empty, the default value will be used.',
      )}
      InputComponent={PrecopyIntervalSelect}
      onConfirmHook={defaultOnConfirmWithIntValue}
      defaultValue="60"
    />
  );
};

export default EditPreCopyInterval;

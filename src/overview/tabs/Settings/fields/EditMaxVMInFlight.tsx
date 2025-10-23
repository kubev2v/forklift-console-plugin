import type { FC } from 'react';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
import SettingsNumberInput from './SettingsNumberInput';

const DEFAULT = 20;

/**
 * MaxVMInFlightNumberInput component.
 * Wraps the SettingsNumberInput component with pre-defined default value.
 */
const MaxVMInFlightNumberInput: InputComponentType = (props) => {
  return <SettingsNumberInput {...props} defaultValue={DEFAULT} />;
};

const EditMaxVMInFlight: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  const { resource } = props;

  return (
    <EditField
      {...props}
      resource={resource as K8sResourceCommon}
      jsonPath={'spec.controller_max_vm_inflight'}
      label={t('Maximum concurrent VM migrations')}
      labelHelp={
        <HelpIconPopover header={t('Maximum concurrent VM migrations')}>
          <ForkliftTrans>
            <Stack hasGutter>
              <StackItem>
                Sets the maximum number of virtual machines or disks that can be migrated
                simultaneously, varies by the source provider type and by the settings of the
                migration.
              </StackItem>
              <StackItem>The default value is 20 virtual machines or disks.</StackItem>
              <StackItem>
                <a
                  href={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS}
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn more
                </a>
              </StackItem>
            </Stack>
          </ForkliftTrans>
        </HelpIconPopover>
      }
      model={ForkliftControllerModel}
      helperText={t(
        'Enter the maximum number of concurrent VM migrations. If empty, the default value will be used.',
      )}
      InputComponent={MaxVMInFlightNumberInput}
      defaultValue={String(DEFAULT)}
      onConfirmHook={defaultOnConfirmWithIntValue}
    />
  );
};

export default EditMaxVMInFlight;

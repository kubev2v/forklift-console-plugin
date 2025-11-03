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
import { snapshotPoolingIntervalOptions } from './options';
import SettingsSelectInput from './SettingsSelectInput';

/**
 * SnapshotPoolingIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const SnapshotPoolingIntervalSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={snapshotPoolingIntervalOptions} />;
};

const EditSnapshotPoolingInterval: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_snapshot_status_check_rate_seconds'}
      label={t('Snapshot polling interval')}
      labelHelp={
        <HelpIconPopover header={t('Snapshot polling interval')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
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
        'Enter the interval in seconds for snapshot pooling. If empty, the default value will be used.',
      )}
      InputComponent={SnapshotPoolingIntervalSelect}
      onConfirmHook={defaultOnConfirmWithIntValue}
      defaultValue="10"
    />
  );
};

export default EditSnapshotPoolingInterval;

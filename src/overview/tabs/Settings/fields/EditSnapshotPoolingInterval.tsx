import type { FC } from 'react';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
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
  { description: 'Extra short snapshot polling interval', key: 1, name: '1s' },
  { description: 'Short snapshot polling interval', key: 5, name: '5s' },
  { description: 'Long snapshot polling interval', key: 10, name: '10s' },
  { description: 'Extra long snapshot polling interval', key: 60, name: '60s' },
];

/**
 * SnapshotPoolingIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const SnapshotPoolingIntervalSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

const EditSnapshotPoolingInterval: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_snapshot_status_check_rate_seconds'}
      label={
        <DisplayTitle
          title={t('Snapshot polling interval')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Text>
              {t(
                'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
              )}
            </Text>
          }
          crumbs={['spec', 'controller_snapshot_status_check_rate_seconds']}
        />
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

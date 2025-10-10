import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Content } from '@patternfly/react-core';
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
      label={
        <DisplayTitle
          title={t('Snapshot polling interval')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Content component="p">
              {t(
                'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
              )}
            </Content>
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

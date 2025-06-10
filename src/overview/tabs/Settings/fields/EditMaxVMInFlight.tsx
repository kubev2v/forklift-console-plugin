import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import { defaultOnConfirmWithIntValue } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
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
      label={
        <DisplayTitle
          title={t('Maximum concurrent VM migrations')}
          showHelpIconNextToTitle
          moreInfoLink={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS}
          helpContent={
            <ForkliftTrans>
              Sets the maximum number of virtual machines or disks that can be migrated
              simultaneously, varies by the source provider type and by the settings of the
              migration.
              <br />
              <br />
              The default value is 20 virtual machines or disks.
            </ForkliftTrans>
          }
          crumbs={['spec', 'controller_max_vm_inflight']}
        />
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

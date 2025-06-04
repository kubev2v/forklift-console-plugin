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
  { description: 'Extra small precopy interval', key: 5, name: '5min' },
  { description: 'Small precopy interval', key: 30, name: '30min' },
  { description: 'Large precopy interval', key: 60, name: '60min' },
  { description: 'Extra large precopy interval', key: 120, name: '120min' },
];

/**
 * PrecopyIntervalSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const PrecopyIntervalSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={options} />;
};

const EditPreCopyInterval: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.controller_precopy_interval'}
      label={
        <DisplayTitle
          title={t('Precopy interval')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Text>
              {t(
                'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
              )}
            </Text>
          }
          crumbs={['spec', 'controller_precopy_interval']}
        />
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

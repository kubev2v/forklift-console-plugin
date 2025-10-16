import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ForkliftControllerModel, type K8sResourceCommon } from '@kubev2v/types';
import { Content } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { EditField } from '../cards/EditField';
import type { InputComponentType } from '../cards/EditFieldTypes';

import type { EditSettingsProps } from './EditSettingsProps';
import { inventoryMemoryLimitOptions } from './options';
import SettingsSelectInput from './SettingsSelectInput';

/**
 * InventoryMemoryLimitSelect component.
 * Wraps the SettingsSelectInput component with pre-defined options.
 */
const InventoryMemoryLimitSelect: InputComponentType = (props) => {
  return <SettingsSelectInput {...props} options={inventoryMemoryLimitOptions} />;
};

const EditInventoryMemoryLimit: FC<EditSettingsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditField
      {...props}
      resource={props.resource as K8sResourceCommon}
      jsonPath={'spec.inventory_container_limits_memory'}
      label={
        <DisplayTitle
          title={t('Controller inventory container memory limit')}
          showHelpIconNextToTitle
          moreInfoLink={MTV_SETTINGS}
          helpContent={
            <Content component="p">
              {t(
                'Sets the memory limits allocated to the inventory container in the controller pod. The default value is 1000Mi.',
              )}
            </Content>
          }
          crumbs={['spec', 'inventory_container_limits_memory']}
        />
      }
      model={ForkliftControllerModel}
      helperText={t(
        'Enter the limit for memory usage by the inventory container in Mi. If empty, the default value will be used.',
      )}
      InputComponent={InventoryMemoryLimitSelect}
      defaultValue="1000Mi"
    />
  );
};

export default EditInventoryMemoryLimit;

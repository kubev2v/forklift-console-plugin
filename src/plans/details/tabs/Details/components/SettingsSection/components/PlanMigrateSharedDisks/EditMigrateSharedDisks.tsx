import { useState } from 'react';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getMigrateSharedDisksValue, onConfirmMigrateSharedDisks } from './utils/utils';
import EditMigrateSharedDisksBody from './EditMigrateSharedDisksBody';
import MigrateSharedDisksSwitch from './MigrateSharedDisksSwitch';

const EditMigrateSharedDisks: ModalComponent<EditPlanProps> = ({
  isVddkInitImageNotSet,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getMigrateSharedDisksValue(resource));

  return (
    <ModalForm
      title={t('Migrate shared disks')}
      onConfirm={async () => onConfirmMigrateSharedDisks({ newValue: value, resource })}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <EditMigrateSharedDisksBody />
        </StackItem>

        <StackItem>
          <MigrateSharedDisksSwitch value={value} onChange={setValue} />
        </StackItem>
        {value && (
          <StackItem className="pf-v6-u-ml-lg">
            <Alert
              isPlain
              isInline
              variant={AlertVariant.info}
              title={t('This may slow down the migration process')}
            />
          </StackItem>
        )}
        {!value && isVddkInitImageNotSet && (
          <StackItem>
            <PlanVddkForSharedDisksWarningAlert />
          </StackItem>
        )}
      </Stack>
    </ModalForm>
  );
};

export default EditMigrateSharedDisks;

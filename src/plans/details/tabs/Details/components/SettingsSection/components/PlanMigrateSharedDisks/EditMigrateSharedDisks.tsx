import { useState } from 'react';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getMigrateSharedDisksValue, onConfirmMigrateSharedDisks } from './utils/utils';

const EditMigrateSharedDisks: ModalComponent<EditPlanProps> = ({
  isVddkInitImageNotSet,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getMigrateSharedDisksValue(resource));

  return (
    <ModalForm
      title={t('Edit shared disks')}
      description={t('Choose whether to migrate shared disks with your migration.')}
      headerHelp={
        <HelpIconPopover header={t('Migrate shared disks')}>
          {t(
            'MTV behavior is based on the Shared disks setting in the plan. If checked, the shared disks will be migrated, otherwise the shared disks will not be migrated.',
          )}
        </HelpIconPopover>
      }
      onConfirm={async () => onConfirmMigrateSharedDisks({ newValue: value, resource })}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="migrate-shared-disks-checkbox"
            data-testid="migrate-shared-disks-checkbox"
            label={t('Migrate shared disks')}
            isChecked={value}
            onChange={(_, checked) => {
              setValue(checked);
            }}
          />
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

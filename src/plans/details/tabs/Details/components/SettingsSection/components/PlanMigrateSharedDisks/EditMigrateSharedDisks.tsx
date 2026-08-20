import { useState } from 'react';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getMigrateSharedDisksValue, onConfirmMigrateSharedDisks } from './utils/utils';

const EditMigrateSharedDisks: OverlayComponent<EditPlanProps> = ({
  closeOverlay,
  isVddkInitImageNotSet,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(getMigrateSharedDisksValue(resource));

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      description={t('Choose whether to migrate shared disks with your migration.')}
      headerHelp={
        <HelpIconPopover header={t('Migrate shared disks')}>
          {t(
            'MTV behavior is based on the Shared disks setting in the plan. If checked, the shared disks will be migrated, otherwise the shared disks will not be migrated.',
          )}
        </HelpIconPopover>
      }
      onConfirm={async () => onConfirmMigrateSharedDisks({ newValue: value, resource })}
      title={t('Edit shared disks')}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            data-testid="migrate-shared-disks-checkbox"
            id="migrate-shared-disks-checkbox"
            isChecked={value}
            label={t('Migrate shared disks')}
            onChange={(_, checked) => {
              setValue(checked);
            }}
          />
        </StackItem>
        {value && (
          <StackItem className="pf-v6-u-ml-lg">
            <Alert
              isInline
              isPlain
              title={t('This may slow down the migration process')}
              variant={AlertVariant.info}
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

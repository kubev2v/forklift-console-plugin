import { useCallback } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { MigrationModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack } from '@patternfly/react-core';

import type { CancelMigrationVirtualMachinesProps } from './utils/types';

const CancelMigrationVirtualMachinesModal: OverlayComponent<
  CancelMigrationVirtualMachinesProps
> = ({ closeOverlay, migration, selectedIds }) => {
  const { t } = useForkliftTranslation();

  const handleSave = useCallback(async () => {
    const vms = migration?.spec?.cancel ?? [];
    for (const id of selectedIds) vms.push({ id });
    const op = migration?.spec?.cancel ? REPLACE : ADD;

    return k8sPatch({
      data: [{ op, path: '/spec/cancel', value: vms }],
      model: MigrationModel,
      resource: migration,
    });
  }, [migration, selectedIds]);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={handleSave}
      title={t('Cancel virtual machines migration?')}
    >
      <Stack hasGutter>
        {t('You can cancel the migration of virtual machines in a running migration plan.')}
      </Stack>
    </ModalForm>
  );
};

export default CancelMigrationVirtualMachinesModal;

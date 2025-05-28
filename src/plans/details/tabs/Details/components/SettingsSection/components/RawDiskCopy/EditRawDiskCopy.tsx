import { type FC, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { Stack, StackItem, Switch } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { getDiskRawCopy, onConfirmDiskRawCopy } from './utils/utils';

const EditRawDiskCopy: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getDiskRawCopy(resource)));

  return (
    <ModalForm
      title={t('Raw copy mode')}
      onConfirm={async () => onConfirmDiskRawCopy({ newValue: value, resource })}
    >
      <Stack hasGutter>
        <ForkliftTrans>
          <StackItem>
            If this is set to <strong>true</strong>, the virtual machine is converted as raw copy of
            the disks.
          </StackItem>
          <StackItem>
            If this is set to <strong>false</strong>, the virtual machine is converted using
            virt-v2v.
          </StackItem>
        </ForkliftTrans>
        <StackItem>
          <Switch
            id="raw-disk-copy-switch"
            label={t('Raw copy mode')}
            isChecked={value}
            hasCheckIcon
            onChange={(_, checked) => {
              setValue(checked);
            }}
          />
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditRawDiskCopy;

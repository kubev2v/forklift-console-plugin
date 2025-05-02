import { type FC, useEffect, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Stack } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditLUKSModalAlert from './components/EditLUKSModalAlert';
import EditLUKSModalBody from './components/EditLUKSModalBody';
import { onLUKSEncryptionPasswordsConfirm } from './utils/utils';
import LUKSPassphraseInputList from './LUKSPassphraseInputList';

const EditLUKSEncryptionPasswords: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();

  const secretName = getLUKSSecretName(resource);
  const secretNamespace = getNamespace(resource);
  const allVMsHasMatchingLuks = getPlanVirtualMachines(resource).every(
    (vm) => vm.luks?.name === secretName,
  );

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: getGroupVersionKindForModel(SecretModel),
    name: secretName,
    namespace: secretNamespace,
  });

  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (secret?.data) {
      const decoded = Object.values(secret.data)
        .map((secretData) => {
          try {
            return atob(secretData);
          } catch {
            return '';
          }
        })
        .filter(Boolean);

      setValue(decoded);
    }
  }, [secret?.data]);

  if (secretName && !secret?.data) return null;

  return (
    <ModalForm
      title={t('Disk decryption passphrases')}
      onConfirm={async () =>
        onLUKSEncryptionPasswordsConfirm({
          newValue: JSON.stringify(value),
          resource,
        })
      }
    >
      <Stack hasGutter>
        <EditLUKSModalBody />
        <FormGroup label={t('Passphrases for LUKS encrypted devices')} />
      </Stack>
      <LUKSPassphraseInputList value={value} onChange={setValue} />
      <EditLUKSModalAlert shouldRender={!allVMsHasMatchingLuks} />
    </ModalForm>
  );
};

export default EditLUKSEncryptionPasswords;

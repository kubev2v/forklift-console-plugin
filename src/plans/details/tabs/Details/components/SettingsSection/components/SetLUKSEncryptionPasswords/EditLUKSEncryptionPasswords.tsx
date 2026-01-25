import { useEffect, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox, FormGroup, Stack } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps, EnhancedPlanSpecVms } from '../../utils/types';

import EditLUKSModalAlert from './components/EditLUKSModalAlert';
import EditLUKSModalBody from './components/EditLUKSModalBody';
import { onDiskDecryptionConfirm } from './utils/utils';
import LUKSPassphraseInputList from './LUKSPassphraseInputList';

const EditLUKSEncryptionPasswords: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
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
  const [nbdeClevis, setNbdeClevis] = useState<boolean>(false);

  // Get current NBDE setting from the first VM (all VMs have the same setting)
  useEffect(() => {
    const vms = getPlanVirtualMachines(resource) as EnhancedPlanSpecVms[];
    if (!isEmpty(vms)) {
      setNbdeClevis(vms[0]?.nbdeClevis ?? false);
    }
  }, [resource]);

  useEffect(() => {
    if (secret?.data && !nbdeClevis) {
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
  }, [secret?.data, nbdeClevis]);

  // Clear passphrases when NBDE is enabled
  useEffect(() => {
    if (nbdeClevis) {
      setValue([]);
    }
  }, [nbdeClevis]);

  if (secretName && !secret?.data) return null;

  return (
    <ModalForm
      title={t('Disk decryption')}
      testId="edit-disk-decryption-modal"
      onConfirm={async () =>
        onDiskDecryptionConfirm({
          nbdeClevis,
          newValue: JSON.stringify(value),
          resource,
        })
      }
      {...rest}
    >
      <Stack hasGutter>
        <EditLUKSModalBody />

        <Checkbox
          id="nbde-clevis-checkbox-modal"
          data-testid="use-nbde-clevis-checkbox"
          isChecked={nbdeClevis}
          onChange={(_event, checked) => {
            setNbdeClevis(checked);
          }}
          label={t('Use network-bound disk encryption (NBDE/Clevis)')}
          className="pf-v6-u-mt-lg"
        />

        {!nbdeClevis && <FormGroup label={t('Passphrases for LUKS encrypted devices')} />}
      </Stack>
      {!nbdeClevis && <LUKSPassphraseInputList value={value} onChange={setValue} />}
      <EditLUKSModalAlert shouldRender={!allVMsHasMatchingLuks} />
    </ModalForm>
  );
};

export default EditLUKSEncryptionPasswords;

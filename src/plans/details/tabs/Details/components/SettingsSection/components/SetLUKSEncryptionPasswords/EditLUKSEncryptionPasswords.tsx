import { useCallback, useEffect, useMemo, useState } from 'react';

import LUKSSecretSelect from '@components/LUKSSecretSelect/LUKSSecretSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox, Flex, FlexItem, FormGroup, Radio, Stack } from '@patternfly/react-core';
import { getNamespace, getUID } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import type { EditPlanProps } from '../../utils/types';

import EditLUKSModalAlert from './components/EditLUKSModalAlert';
import EditLUKSModalBody from './components/EditLUKSModalBody';
import { onDiskDecryptionConfirm } from './utils/utils';
import LUKSPassphraseInputList from './LUKSPassphraseInputList';

const DECRYPTION_MODE_EXISTING = 'existing';
const DECRYPTION_MODE_PASSPHRASES = 'passphrases';
type DecryptionMode = typeof DECRYPTION_MODE_EXISTING | typeof DECRYPTION_MODE_PASSPHRASES;

const EditLUKSEncryptionPasswords: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();

  const secretName = getLUKSSecretName(resource);
  const secretNamespace = getNamespace(resource);
  const allVMsHasMatchingLuks = getPlanVirtualMachines(resource).every(
    (vm) => vm.luks?.name === secretName,
  );

  const watchResource: WatchK8sResource | null = useMemo(
    () =>
      secretName
        ? {
            groupVersionKind: getGroupVersionKindForModel(SecretModel),
            name: secretName,
            namespace: secretNamespace,
          }
        : null,
    [secretName, secretNamespace],
  );

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>(watchResource);

  const [value, setValue] = useState<string[]>([]);
  const [nbdeClevis, setNbdeClevis] = useState<boolean>(false);
  const [decryptionMode, setDecryptionMode] = useState<DecryptionMode>(DECRYPTION_MODE_PASSPHRASES);
  const [selectedSecretName, setSelectedSecretName] = useState<string>(secretName ?? '');

  useEffect(() => {
    const vms = getPlanVirtualMachines(resource) as EnhancedPlanSpecVms[];
    if (!isEmpty(vms)) {
      setNbdeClevis(vms[0]?.nbdeClevis ?? false);
    }
  }, [resource]);

  useEffect(() => {
    if (secretName && secret?.data && !nbdeClevis) {
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
  }, [secretName, secret?.data, nbdeClevis]);

  useEffect(() => {
    if (nbdeClevis) {
      setValue([]);
    }
  }, [nbdeClevis]);

  const handleConfirm = useCallback(async () => {
    if (decryptionMode === DECRYPTION_MODE_EXISTING) {
      const isPlanOwned =
        secret?.metadata?.ownerReferences?.some(
          (ref) => ref.kind === 'Plan' && ref.uid === getUID(resource),
        ) ?? false;

      return onDiskDecryptionConfirm({
        existingSecretName: selectedSecretName,
        isCurrentSecretPlanOwned: isPlanOwned,
        nbdeClevis: false,
        newValue: JSON.stringify([]),
        resource,
      });
    }

    return onDiskDecryptionConfirm({
      nbdeClevis,
      newValue: JSON.stringify(value),
      resource,
    });
  }, [decryptionMode, nbdeClevis, resource, secret, selectedSecretName, value]);

  return (
    <ModalForm
      title={t('Disk decryption')}
      testId="edit-disk-decryption-modal"
      onConfirm={handleConfirm}
      isDisabled={decryptionMode === DECRYPTION_MODE_EXISTING && !selectedSecretName}
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

        {!nbdeClevis && (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <FlexItem>
              <Stack hasGutter>
                <Radio
                  data-testid="edit-use-existing-secret-radio"
                  id={DECRYPTION_MODE_EXISTING}
                  name="diskDecryptionMode"
                  label={t('Use an existing secret')}
                  value={DECRYPTION_MODE_EXISTING}
                  isChecked={decryptionMode === DECRYPTION_MODE_EXISTING}
                  onChange={() => {
                    setDecryptionMode(DECRYPTION_MODE_EXISTING);
                  }}
                  description={t('Select a pre-existing secret containing LUKS decryption keys.')}
                />

                {decryptionMode === DECRYPTION_MODE_EXISTING && secretNamespace && (
                  <LUKSSecretSelect
                    id="edit-existing-luks-secret"
                    testId="edit-luks-secret-select"
                    value={selectedSecretName}
                    onSelect={(_, selectedSecret) => {
                      setSelectedSecretName(selectedSecret.metadata?.name ?? '');
                    }}
                    namespace={secretNamespace}
                  />
                )}
              </Stack>
            </FlexItem>

            <FlexItem>
              <Stack hasGutter>
                <Radio
                  data-testid="edit-use-passphrases-radio"
                  id={DECRYPTION_MODE_PASSPHRASES}
                  name="diskDecryptionMode"
                  label={t('Enter passphrases')}
                  description={t(
                    'Provide passphrases that will be stored in a secret owned by this plan.',
                  )}
                  value={DECRYPTION_MODE_PASSPHRASES}
                  isChecked={decryptionMode === DECRYPTION_MODE_PASSPHRASES}
                  onChange={() => {
                    setDecryptionMode(DECRYPTION_MODE_PASSPHRASES);
                  }}
                />

                {decryptionMode === DECRYPTION_MODE_PASSPHRASES && (
                  <>
                    <FormGroup label={t('Passphrases for LUKS encrypted devices')} />
                    <LUKSPassphraseInputList value={value} onChange={setValue} />
                  </>
                )}
              </Stack>
            </FlexItem>
          </Flex>
        )}
      </Stack>
      <EditLUKSModalAlert shouldRender={!allVMsHasMatchingLuks} />
    </ModalForm>
  );
};

export default EditLUKSEncryptionPasswords;

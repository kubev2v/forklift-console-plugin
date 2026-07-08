import LUKSSecretSelect from '@components/LUKSSecretSelect/LUKSSecretSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox, Flex, FlexItem, FormGroup, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditLUKSModalAlert from './components/EditLUKSModalAlert';
import EditLUKSModalBody from './components/EditLUKSModalBody';
import {
  DECRYPTION_MODE_EXISTING,
  DECRYPTION_MODE_PASSPHRASES,
  useEditLUKSState,
} from './hooks/useEditLUKSState';
import LUKSPassphraseInputList from './LUKSPassphraseInputList';

const EditLUKSEncryptionPasswords: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();

  const {
    allVMsHasMatchingLuks,
    decryptionMode,
    handleConfirm,
    isDisabled,
    nbdeClevis,
    secretNamespace,
    selectedSecret,
    setDecryptionMode,
    setNbdeClevis,
    setSelectedSecret,
    setValue,
    value,
  } = useEditLUKSState(resource);

  return (
    <ModalForm
      title={t('Disk decryption')}
      testId="edit-disk-decryption-modal"
      onConfirm={handleConfirm}
      isDisabled={isDisabled}
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
                    value={selectedSecret?.metadata?.name ?? ''}
                    onSelect={(_, selected) => {
                      setSelectedSecret(selected);
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

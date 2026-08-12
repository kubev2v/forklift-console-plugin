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
      isDisabled={isDisabled}
      onConfirm={handleConfirm}
      testId="edit-disk-decryption-modal"
      title={t('Disk decryption')}
      {...rest}
    >
      <Stack hasGutter>
        <EditLUKSModalBody />

        <Checkbox
          className="pf-v6-u-mt-lg"
          data-testid="use-nbde-clevis-checkbox"
          id="nbde-clevis-checkbox-modal"
          isChecked={nbdeClevis}
          label={t('Use network-bound disk encryption (NBDE/Clevis)')}
          onChange={(_event, checked) => {
            setNbdeClevis(checked);
          }}
        />

        {!nbdeClevis && (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <FlexItem>
              <Stack hasGutter>
                <Radio
                  data-testid="edit-use-existing-secret-radio"
                  description={t('Select a pre-existing secret containing LUKS decryption keys.')}
                  id={DECRYPTION_MODE_EXISTING}
                  isChecked={decryptionMode === DECRYPTION_MODE_EXISTING}
                  label={t('Use an existing secret')}
                  name="diskDecryptionMode"
                  onChange={() => {
                    setDecryptionMode(DECRYPTION_MODE_EXISTING);
                  }}
                  value={DECRYPTION_MODE_EXISTING}
                />

                {decryptionMode === DECRYPTION_MODE_EXISTING && secretNamespace && (
                  <LUKSSecretSelect
                    id="edit-existing-luks-secret"
                    namespace={secretNamespace}
                    onSelect={(_, selected) => {
                      setSelectedSecret(selected);
                    }}
                    testId="edit-luks-secret-select"
                    value={selectedSecret?.metadata?.name ?? ''}
                  />
                )}
              </Stack>
            </FlexItem>

            <FlexItem>
              <Stack hasGutter>
                <Radio
                  data-testid="edit-use-passphrases-radio"
                  description={t(
                    'Provide passphrases that will be stored in a secret owned by this plan.',
                  )}
                  id={DECRYPTION_MODE_PASSPHRASES}
                  isChecked={decryptionMode === DECRYPTION_MODE_PASSPHRASES}
                  label={t('Enter passphrases')}
                  name="diskDecryptionMode"
                  onChange={() => {
                    setDecryptionMode(DECRYPTION_MODE_PASSPHRASES);
                  }}
                  value={DECRYPTION_MODE_PASSPHRASES}
                />

                {decryptionMode === DECRYPTION_MODE_PASSPHRASES && (
                  <>
                    <FormGroup label={t('Passphrases for LUKS encrypted devices')} />
                    <LUKSPassphraseInputList onChange={setValue} value={value} />
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

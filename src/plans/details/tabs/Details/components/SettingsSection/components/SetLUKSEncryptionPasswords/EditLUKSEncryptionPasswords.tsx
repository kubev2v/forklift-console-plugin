import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  Checkbox,
  HelperText,
  HelperTextItem,
  Spinner,
  Stack,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import EditLUKSDecryptionModeFields from './components/EditLUKSDecryptionModeFields';
import EditLUKSModalAlert from './components/EditLUKSModalAlert';
import EditLUKSModalBody from './components/EditLUKSModalBody';
import { useEditLUKSState } from './hooks/useEditLUKSState';
import { getSecretWatchErrorMessage } from './utils/secretWatchErrorMessage';

const EditLUKSEncryptionPasswords: OverlayComponent<EditPlanProps> = ({
  closeOverlay,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const {
    allVMsHasMatchingLuks,
    decryptionMode,
    handleConfirm,
    isDisabled,
    isSecretWatchPending,
    isSourceSecretUnavailable,
    nbdeClevis,
    secretLoadError,
    secretNamespace,
    selectedSecret,
    setDecryptionMode,
    setNbdeClevis,
    setSelectedSecret,
    setValue,
    value,
  } = useEditLUKSState(resource);

  const secretWatchErrorMessage = getSecretWatchErrorMessage(secretLoadError);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={isDisabled}
      onConfirm={handleConfirm}
      testId="edit-disk-decryption-modal"
      title={t('Disk decryption')}
    >
      <Stack hasGutter>
        <EditLUKSModalBody />

        {isSecretWatchPending && (
          <HelperText data-testid="edit-luks-secret-loading">
            <HelperTextItem icon={<Spinner size="md" />}>
              {t('Loading disk decryption secret...')}
            </HelperTextItem>
          </HelperText>
        )}

        {secretLoadError ? (
          <Alert
            data-testid="edit-luks-secret-load-error"
            isInline
            title={t('Unable to load disk decryption secret')}
            variant={AlertVariant.danger}
          >
            {secretWatchErrorMessage}
          </Alert>
        ) : null}

        {isSourceSecretUnavailable && (
          <Alert
            data-testid="edit-luks-source-secret-unavailable-alert"
            isInline
            title={t('Referenced secret unavailable')}
            variant={AlertVariant.warning}
          >
            {t(
              'The secret previously selected for disk decryption could not be found. Enter passphrases or choose another secret.',
            )}
          </Alert>
        )}

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

        <EditLUKSDecryptionModeFields
          decryptionMode={decryptionMode}
          isSecretWatchPending={isSecretWatchPending}
          nbdeClevis={nbdeClevis}
          secretNamespace={secretNamespace}
          selectedSecret={selectedSecret}
          setDecryptionMode={setDecryptionMode}
          setSelectedSecret={setSelectedSecret}
          setValue={setValue}
          value={value}
        />
      </Stack>
      <EditLUKSModalAlert shouldRender={!allVMsHasMatchingLuks} />
    </ModalForm>
  );
};

export default EditLUKSEncryptionPasswords;

import type { Dispatch, FC, SetStateAction } from 'react';

import LUKSSecretSelect from '@components/LUKSSecretSelect/LUKSSecretSelect';
import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { Flex, FlexItem, FormGroup, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import {
  DECRYPTION_MODE_EXISTING,
  DECRYPTION_MODE_PASSPHRASES,
  type DecryptionMode,
} from '../hooks/useEditLUKSState';
import LUKSPassphraseInputList from '../LUKSPassphraseInputList';

type EditLUKSDecryptionModeFieldsProps = {
  decryptionMode: DecryptionMode;
  isSecretWatchPending: boolean;
  nbdeClevis: boolean;
  secretNamespace?: string;
  selectedSecret?: IoK8sApiCoreV1Secret;
  setDecryptionMode: Dispatch<SetStateAction<DecryptionMode>>;
  setSelectedSecret: Dispatch<SetStateAction<IoK8sApiCoreV1Secret | undefined>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  value: string[];
};

const EditLUKSDecryptionModeFields: FC<EditLUKSDecryptionModeFieldsProps> = ({
  decryptionMode,
  isSecretWatchPending,
  nbdeClevis,
  secretNamespace,
  selectedSecret,
  setDecryptionMode,
  setSelectedSecret,
  setValue,
  value,
}) => {
  const { t } = useForkliftTranslation();

  if (nbdeClevis) {
    return null;
  }

  return (
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

          {decryptionMode === DECRYPTION_MODE_PASSPHRASES && !isSecretWatchPending && (
            <>
              <FormGroup label={t('Passphrases for LUKS encrypted devices')} />
              <LUKSPassphraseInputList onChange={setValue} value={value} />
            </>
          )}
        </Stack>
      </FlexItem>
    </Flex>
  );
};

export default EditLUKSDecryptionModeFields;

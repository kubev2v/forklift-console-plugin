import { type FC, useCallback, useId, useRef, useState } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Button, ButtonVariant, Checkbox, Form, FormGroup } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { MAX_PASSPHRASES } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { toPassphraseEntries } from './utils/toPassphraseEntries';
import type { PassphraseEntry, VmOverrides } from './utils/types';
import PassphraseTable from './PassphraseTable';

type VmConfigFormProps = {
  onChange: (vmId: string, overrides: VmOverrides) => void;
  overrides: VmOverrides;
  vmId: string;
};

const VmConfigForm: FC<VmConfigFormProps> = ({ onChange, overrides, vmId }) => {
  const { t } = useForkliftTranslation();
  const idPrefix = useId();
  const nextIdRef = useRef((overrides.passphrases ?? []).length);
  const [localPhrases, setLocalPhrases] = useState<PassphraseEntry[]>(() =>
    toPassphraseEntries(overrides.passphrases, idPrefix),
  );

  const pushOverrides = useCallback(
    (patch: Partial<VmOverrides>): void => {
      onChange(vmId, { ...overrides, ...patch });
    },
    [onChange, overrides, vmId],
  );

  const handleNbdeClevisChange = (_event: unknown, checked: boolean): void => {
    setLocalPhrases([]);
    pushOverrides({ nbdeClevis: checked, passphrases: [] });
  };

  const addPassphrase = (): void => {
    const updated = [...localPhrases, { id: `${idPrefix}-${nextIdRef.current}`, value: '' }];
    nextIdRef.current += 1;
    setLocalPhrases(updated);
    pushOverrides({ passphrases: updated.map((entry) => entry.value) });
  };

  const removePassphrase = (id: string): void => {
    const updated = localPhrases.filter((entry) => entry.id !== id);
    setLocalPhrases(updated);
    pushOverrides({ passphrases: updated.map((entry) => entry.value) });
  };

  const updateLocalPassphrase = (id: string, value: string): void => {
    setLocalPhrases((prev) => prev.map((entry) => (entry.id === id ? { ...entry, value } : entry)));
  };

  const commitPassphrase = (): void => {
    pushOverrides({ passphrases: localPhrases.map((entry) => entry.value) });
  };

  return (
    <Form className="pf-v6-u-py-md pf-v6-u-pl-xl">
      <FormGroup
        label={t('Disk encryption')}
        labelHelp={
          <HelpIconPopover>
            {t(
              'Automatically decrypt LUKS-encrypted disks using Tang servers during inspection or provide manual passphrases.',
            )}
          </HelpIconPopover>
        }
      >
        <Checkbox
          data-testid={`nbde-clevis-checkbox-${vmId}`}
          description={t(
            'Use Tang servers for network-bound decryption instead of manual passphrases.',
          )}
          id={`nbde-clevis-${vmId}`}
          isChecked={overrides.nbdeClevis ?? false}
          label={t('Use NBDE/Clevis')}
          onChange={handleNbdeClevisChange}
        />
      </FormGroup>

      {!overrides.nbdeClevis && (
        <FormGroup label={t('Disk decryption passphrases')}>
          {!isEmpty(localPhrases) && (
            <PassphraseTable
              onBlur={commitPassphrase}
              onChange={updateLocalPassphrase}
              onRemove={removePassphrase}
              phrases={localPhrases}
              vmId={vmId}
            />
          )}
          <Button
            icon={<PlusCircleIcon />}
            isDisabled={localPhrases.length >= MAX_PASSPHRASES}
            onClick={addPassphrase}
            size="sm"
            variant={ButtonVariant.link}
          >
            {t('Add passphrase')}
          </Button>
        </FormGroup>
      )}

      <FormGroup label={t('XFS compatibility')}>
        <Checkbox
          data-testid={`xfs-compat-checkbox-${vmId}`}
          description={t(
            'XFS v4 and BTRFS support are mutually exclusive. Enable for XFS v4 filesystems; leave disabled for BTRFS.',
          )}
          id={`xfs-compat-${vmId}`}
          isChecked={overrides.xfsCompatibility ?? false}
          label={t('Enable XFS v4 compatibility')}
          onChange={(_event, checked) => {
            pushOverrides({ xfsCompatibility: checked });
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default VmConfigForm;

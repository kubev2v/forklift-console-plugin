import { type FC, useCallback, useState } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { MAX_PASSPHRASES } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { VmOverrides } from './utils/types';

type VmConfigFormProps = {
  onChange: (vmId: string, overrides: VmOverrides) => void;
  overrides: VmOverrides;
  vmId: string;
};

const VmConfigForm: FC<VmConfigFormProps> = ({ onChange, overrides, vmId }) => {
  const { t } = useForkliftTranslation();
  const [localPhrases, setLocalPhrases] = useState<string[]>(overrides.passphrases ?? []);

  const pushOverrides = useCallback(
    (patch: Partial<VmOverrides>): void => {
      onChange(vmId, { ...overrides, ...patch });
    },
    [onChange, overrides, vmId],
  );

  const handleNbdeClevisChange = (_event: unknown, checked: boolean): void => {
    const cleared: string[] = [];
    setLocalPhrases(cleared);
    pushOverrides({ nbdeClevis: checked, passphrases: cleared });
  };

  const addPassphrase = (): void => {
    const updated = [...localPhrases, ''];
    setLocalPhrases(updated);
    pushOverrides({ passphrases: updated });
  };

  const removePassphrase = (index: number): void => {
    const updated = localPhrases.filter((_, idx) => idx !== index);
    setLocalPhrases(updated);
    pushOverrides({ passphrases: updated });
  };

  const updateLocalPassphrase = (index: number, value: string): void => {
    setLocalPhrases((prev) => prev.map((phrase, idx) => (idx === index ? value : phrase)));
  };

  const commitPassphrase = (): void => {
    pushOverrides({ passphrases: localPhrases });
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
          id={`nbde-clevis-${vmId}`}
          data-testid={`nbde-clevis-checkbox-${vmId}`}
          isChecked={overrides.nbdeClevis ?? false}
          onChange={handleNbdeClevisChange}
          label={t('Use NBDE/Clevis')}
          description={t(
            'Use Tang servers for network-bound decryption instead of manual passphrases.',
          )}
        />
      </FormGroup>

      {!overrides.nbdeClevis && (
        <FormGroup label={t('Disk decryption passphrases')}>
          {!isEmpty(localPhrases) && (
            <Table borders={false} variant={TableVariant.compact}>
              <Tbody>
                {localPhrases.map((phrase, index) => (
                  <Tr key={index}>
                    <Td>
                      <TextInput
                        value={phrase}
                        onChange={(_event, value) => {
                          updateLocalPassphrase(index, value);
                        }}
                        onBlur={commitPassphrase}
                        aria-label={t('Passphrase {{index}}', { index: index + 1 })}
                        data-testid={`luks-passphrase-${vmId}-${index}`}
                      />
                    </Td>
                    <Td isActionCell>
                      <Button
                        variant={ButtonVariant.plain}
                        onClick={() => {
                          removePassphrase(index);
                        }}
                        aria-label={t('Remove passphrase')}
                      >
                        <MinusCircleIcon />
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
          <Button
            variant={ButtonVariant.link}
            icon={<PlusCircleIcon />}
            isDisabled={localPhrases.length >= MAX_PASSPHRASES}
            onClick={addPassphrase}
            size="sm"
          >
            {t('Add passphrase')}
          </Button>
        </FormGroup>
      )}

      <FormGroup label={t('XFS compatibility')}>
        <Checkbox
          id={`xfs-compat-${vmId}`}
          data-testid={`xfs-compat-checkbox-${vmId}`}
          isChecked={overrides.xfsCompatibility ?? false}
          onChange={(_event, checked) => {
            pushOverrides({ xfsCompatibility: checked });
          }}
          label={t('Enable XFS v4 compatibility')}
          description={t(
            'XFS v4 and BTRFS support are mutually exclusive. Enable for XFS v4 filesystems; leave disabled for BTRFS.',
          )}
        />
      </FormGroup>
    </Form>
  );
};

export default VmConfigForm;

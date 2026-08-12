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
            <Table borders={false} variant={TableVariant.compact}>
              <Tbody>
                {localPhrases.map((phrase, index) => (
                  <Tr key={index}>
                    <Td>
                      <TextInput
                        aria-label={t('Passphrase {{index}}', { index: index + 1 })}
                        data-testid={`luks-passphrase-${vmId}-${index}`}
                        onBlur={commitPassphrase}
                        onChange={(_event, value) => {
                          updateLocalPassphrase(index, value);
                        }}
                        value={phrase}
                      />
                    </Td>
                    <Td isActionCell>
                      <Button
                        aria-label={t('Remove passphrase')}
                        onClick={() => {
                          removePassphrase(index);
                        }}
                        variant={ButtonVariant.plain}
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

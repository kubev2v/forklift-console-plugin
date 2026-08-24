import type { FC } from 'react';

import { Button, ButtonVariant, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import type { PassphraseEntry } from './utils/types';

type PassphraseTableProps = {
  onBlur: () => void;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  phrases: PassphraseEntry[];
  vmId: string;
};

const PassphraseTable: FC<PassphraseTableProps> = ({
  onBlur,
  onChange,
  onRemove,
  phrases,
  vmId,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Table borders={false} variant={TableVariant.compact}>
      <Tbody>
        {phrases.map((entry, index) => (
          <Tr key={entry.id}>
            <Td>
              <TextInput
                aria-label={t('Passphrase {{index}}', { index: index + 1 })}
                data-testid={`luks-passphrase-${vmId}-${index}`}
                onBlur={onBlur}
                onChange={(_event, value) => {
                  onChange(entry.id, value);
                }}
                value={entry.value}
              />
            </Td>
            <Td isActionCell>
              <Button
                aria-label={t('Remove passphrase')}
                onClick={() => {
                  onRemove(entry.id);
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
  );
};

export default PassphraseTable;

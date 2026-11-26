import { type ReactElement, useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { Button, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import {
  defaultDiskPassPhrase,
  maxDiskPassPhrases,
  otherFormFieldLabels,
  OtherSettingsFormFieldId,
  passwordInput,
  textInput,
} from './constants';
import { getDiskPassPhraseFieldId } from './utils';

const DiskPassPhraseFieldTable = (): ReactElement => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();
  const [reveal, setReveal] = useState(false);

  const {
    append,
    fields: diskPassPhrases,
    remove,
  } = useFieldArray({
    control,
    name: OtherSettingsFormFieldId.DiskDecryptionPassPhrases,
  });

  return (
    <FieldBuilderTable
      addButton={{
        isDisabled: diskPassPhrases.length === maxDiskPassPhrases,
        label: t('Add passphrase'),
        onClick: () => {
          append(defaultDiskPassPhrase);
        },
      }}
      additionalActions={
        <Button
          data-testid="passphrase-reveal-button"
          icon={reveal ? <EyeSlashIcon /> : <EyeIcon />}
          isInline
          onClick={() => {
            setReveal((prev) => !prev);
          }}
        >
          {reveal ? t('Hide values') : t('Reveal values')}
        </Button>
      }
      fieldRows={diskPassPhrases.map((fieldRow, index) => ({
        ...fieldRow,
        inputs: [
          <Controller
            control={control}
            key={getDiskPassPhraseFieldId(index)}
            name={getDiskPassPhraseFieldId(index)}
            render={({ field }) => (
              <TextInput
                type={reveal ? textInput : passwordInput}
                {...field}
                aria-label={t('Passphrase {{number}}', { number: index + 1 })}
              />
            )}
          />,
        ],
      }))}
      headers={[
        {
          label: otherFormFieldLabels[OtherSettingsFormFieldId.DiskDecryptionPassPhrases],
          labelHelp: (
            <HelpIconPopover>
              <Stack hasGutter>
                <StackItem>
                  {t(
                    'Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate.',
                  )}
                </StackItem>

                <StackItem>
                  {t(
                    'For each LUKS-encrypted device, migration toolkit for virtualization (MTV) tries each passphrase until one unlocks the device.',
                  )}
                </StackItem>

                {VIRT_V2V_HELP_LINK && (
                  <StackItem>
                    <ExternalLink href={VIRT_V2V_HELP_LINK} isInline>
                      {t('Learn more')}
                    </ExternalLink>
                  </StackItem>
                )}
              </Stack>
            </HelpIconPopover>
          ),
          width: 90,
        },
      ]}
      removeButton={{
        onClick: (index) => {
          if (diskPassPhrases.length > 1) {
            remove(index);
            return;
          }

          setValue(OtherSettingsFormFieldId.DiskDecryptionPassPhrases, [defaultDiskPassPhrase]);
        },
      }}
    />
  );
};

export default DiskPassPhraseFieldTable;

import { Controller, useFieldArray } from 'react-hook-form';
import HelpIconWithLabel from 'src/plans/components/HelpIconWithLabel';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import { useCreatePlanFormContext } from '../../hooks';

import {
  defaultDiskPassPhrase,
  maxDiskPassPhrases,
  otherFormFieldLabels,
  OtherSettingsFormFieldId,
} from './constants';
import { getDiskPassPhraseFieldId } from './utils';

const DiskPassPhraseFieldTable = () => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();

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
      headers={[
        {
          label: (
            <HelpIconWithLabel
              label={otherFormFieldLabels[OtherSettingsFormFieldId.DiskDecryptionPassPhrases]}
            >
              <Stack hasGutter>
                <StackItem>
                  {t(
                    'Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate.',
                  )}
                </StackItem>

                <StackItem>
                  {t(
                    'For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each passphrase until one unlocks the device.',
                  )}
                </StackItem>

                <StackItem>
                  <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
                    {t('Learn more')}
                  </ExternalLink>
                </StackItem>
              </Stack>
            </HelpIconWithLabel>
          ),
        },
      ]}
      fieldRows={diskPassPhrases.map((fieldRow, index) => ({
        ...fieldRow,
        inputs: [
          <FormGroup fieldId={getDiskPassPhraseFieldId(index)}>
            <Controller
              name={getDiskPassPhraseFieldId(index)}
              control={control}
              render={({ field }) => <TextInput {...field} />}
            />
          </FormGroup>,
        ],
      }))}
      addButton={{
        isDisabled: diskPassPhrases.length === maxDiskPassPhrases,
        label: t('Add passphrase'),
        onClick: () => {
          append(defaultDiskPassPhrase);
        },
      }}
      onRemove={(index) => {
        if (diskPassPhrases.length > 1) {
          remove(index);
          return;
        }

        setValue(getDiskPassPhraseFieldId(index), '');
      }}
    />
  );
};

export default DiskPassPhraseFieldTable;

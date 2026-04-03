import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  DefaultScript,
  GuestType,
  GuestTypeLabels,
  ScriptsFieldLabels,
  ScriptType,
  ScriptTypeLabels,
} from 'src/plans/create/steps/customization-scripts/constants';
import ScriptContentField from 'src/plans/create/steps/customization-scripts/ScriptContentField';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import Select from '@components/common/Select';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { validateScriptContent, validateUniqueScriptName } from '../../utils/validateScripts';

type ScriptEditTableProps = {
  append: (value: CustomScript) => void;
  fields: { id: string }[];
  remove: (index: number) => void;
  scriptNames: string[];
};

const ScriptEditTable: FC<ScriptEditTableProps> = ({ append, fields, remove, scriptNames }) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useFormContext<{ scripts: CustomScript[] }>();

  const watchedScripts = useWatch({ control, name: 'scripts' });

  return (
    <FieldBuilderTable
      headers={[
        { label: ScriptsFieldLabels.name, width: 35 },
        { label: ScriptsFieldLabels.guestType, width: 25 },
        { label: ScriptsFieldLabels.scriptType, width: 25 },
      ]}
      fieldRows={fields.map((fieldRow, index) => {
        const guestType = watchedScripts?.[index]?.guestType ?? GuestType.Linux;
        const isWindows = guestType === GuestType.Windows;

        return {
          ...fieldRow,
          additionalOptions: (
            <Controller
              control={control}
              name={`scripts.${index}.content`}
              rules={{ validate: (value) => validateScriptContent(value) }}
              render={({ field: { onChange, value } }) => (
                <ScriptContentField guestType={guestType} onChange={onChange} value={value} />
              )}
            />
          ),
          inputs: [
            <Controller
              key="name"
              control={control}
              name={`scripts.${index}.name`}
              rules={{
                validate: (value) => validateUniqueScriptName(value, index, scriptNames),
              }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  data-testid={`script-name-input-${index}`}
                  placeholder={t('Script name')}
                />
              )}
            />,
            <Controller
              key="guestType"
              control={control}
              name={`scripts.${index}.guestType`}
              render={({ field: guestTypeField }) => (
                <Select
                  id={`scripts.${index}.guestType`}
                  value={GuestTypeLabels[guestTypeField.value]}
                  onSelect={(_event, value) => {
                    guestTypeField.onChange(value);

                    if (value === GuestType.Windows) {
                      setValue(`scripts.${index}.scriptType`, ScriptType.Firstboot);
                    }
                  }}
                  testId={`script-guest-type-select-${index}`}
                >
                  <SelectList>
                    {Object.values(GuestType).map((gt) => (
                      <SelectOption key={gt} value={gt}>
                        {GuestTypeLabels[gt]}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              )}
            />,
            <Controller
              key="scriptType"
              control={control}
              name={`scripts.${index}.scriptType`}
              render={({ field: scriptTypeField }) => (
                <Select
                  id={`scripts.${index}.scriptType`}
                  value={ScriptTypeLabels[scriptTypeField.value]}
                  onSelect={(_event, value) => {
                    scriptTypeField.onChange(value);
                  }}
                  testId={`script-type-select-${index}`}
                >
                  <SelectList>
                    {Object.values(ScriptType).map((st) => (
                      <SelectOption
                        key={st}
                        value={st}
                        isDisabled={isWindows && st === ScriptType.Run}
                        description={
                          isWindows && st === ScriptType.Run
                            ? t('Run scripts are only available for Linux')
                            : undefined
                        }
                      >
                        {ScriptTypeLabels[st]}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              )}
            />,
          ],
        };
      })}
      addButton={{
        label: t('Add script'),
        onClick: () => {
          append(DefaultScript);
        },
      }}
      removeButton={{
        onClick: (index) => {
          remove(index);
        },
      }}
    />
  );
};

export default ScriptEditTable;

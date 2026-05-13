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
import { useScriptFieldValidation } from 'src/plans/create/steps/customization-scripts/hooks/useScriptFieldValidation';
import ScriptContentField from 'src/plans/create/steps/customization-scripts/ScriptContentField';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import Select from '@components/common/Select';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { validateScriptContent } from '../../utils/validateScripts';

type ScriptEditTableProps = {
  append: (value: CustomScript) => void;
  fields: { id: string }[];
  remove: (index: number) => void;
};

const SCRIPTS_FIELD = 'scripts';

const ScriptEditTable: FC<ScriptEditTableProps> = ({ append, fields, remove }) => {
  const { t } = useForkliftTranslation();
  const { control, getValues, setValue, trigger } = useFormContext<{ scripts: CustomScript[] }>();

  const watchedScripts = useWatch({ control, name: SCRIPTS_FIELD });
  const triggerByName = async (name?: string | string[]): Promise<boolean> =>
    trigger(name as Parameters<typeof trigger>[0]);
  const { nameDeps, triggerAllNames, validateName } = useScriptFieldValidation(
    SCRIPTS_FIELD,
    triggerByName,
    () => getValues(SCRIPTS_FIELD),
  );

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
                deps: nameDeps(fields.length) as `scripts.${number}.name`[],
                validate: validateName(index),
              }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TextInput
                    {...field}
                    data-testid={`script-name-input-${index}`}
                    placeholder={t('Script name')}
                    validated={getInputValidated(error)}
                  />
                  <FormErrorHelperText error={error} />
                </>
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
                  onSelect={async (_event, value) => {
                    guestTypeField.onChange(value);

                    if (value === GuestType.Windows) {
                      setValue(`scripts.${index}.scriptType`, ScriptType.Firstboot);
                    }

                    await triggerAllNames(fields.length);
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
                  onSelect={async (_event, value) => {
                    scriptTypeField.onChange(value);
                    await triggerAllNames(fields.length);
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

import type { FC } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

import Select from '@components/common/Select';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import {
  CustomScriptsFieldId,
  DefaultScript,
  GuestType,
  GuestTypeLabels,
  ScriptsFieldLabels,
  ScriptType,
  ScriptTypeLabels,
} from './constants';
import ScriptContentField from './ScriptContentField';
import { getNextOrder, validateScriptName } from './utils';

const NewScriptsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getValues, setValue } = useCreatePlanFormContext();

  const {
    append,
    fields: scripts,
    remove,
  } = useFieldArray({
    control,
    name: CustomScriptsFieldId.Scripts,
  });

  const watchedScripts = useWatch({ control, name: CustomScriptsFieldId.Scripts });

  const getScriptFieldId = (index: number, field: string): string =>
    `${CustomScriptsFieldId.Scripts}.${index}.${field}`;

  const handleAddScript = (): void => {
    const currentScripts = getValues(CustomScriptsFieldId.Scripts);
    append({
      ...DefaultScript,
      order: getNextOrder(currentScripts),
    });
  };

  const handleRemoveScript = (index: number): void => {
    if (scripts.length > 1) {
      remove(index);
      return;
    }

    setValue(CustomScriptsFieldId.Scripts, [DefaultScript]);
  };

  return (
    <div className="pf-v6-u-ml-lg">
      <FieldBuilderTable
        headers={[
          { label: ScriptsFieldLabels.name, width: 35 },
          { label: ScriptsFieldLabels.guestType, width: 25 },
          { label: ScriptsFieldLabels.scriptType, width: 25 },
        ]}
        fieldRows={scripts.map((fieldRow, index) => {
          const guestType = watchedScripts?.[index]?.guestType ?? GuestType.Linux;
          const isWindows = guestType === GuestType.Windows;

          return {
            ...fieldRow,
            additionalOptions: (
              <Controller
                name={getScriptFieldId(index, 'content')}
                control={control}
                render={({ field }) => (
                  <ScriptContentField
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    guestType={guestType}
                  />
                )}
              />
            ),
            inputs: [
              <Controller
                key="name"
                name={getScriptFieldId(index, 'name')}
                control={control}
                rules={{ validate: validateScriptName }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    data-testid={`script-name-${index}`}
                    placeholder={t('Script name')}
                  />
                )}
              />,
              <Controller
                key="guestType"
                name={getScriptFieldId(index, 'guestType')}
                control={control}
                render={({ field: guestTypeField }) => (
                  <Select
                    id={getScriptFieldId(index, 'guestType')}
                    value={GuestTypeLabels[guestTypeField.value as GuestType]}
                    onSelect={(_event, value) => {
                      guestTypeField.onChange(value);

                      if (value === GuestType.Windows) {
                        setValue(getScriptFieldId(index, 'scriptType'), ScriptType.Firstboot);
                      }
                    }}
                    testId={`script-guest-type-${index}`}
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
                name={getScriptFieldId(index, 'scriptType')}
                control={control}
                render={({ field: scriptTypeField }) => (
                  <Select
                    id={getScriptFieldId(index, 'scriptType')}
                    value={ScriptTypeLabels[scriptTypeField.value as ScriptType]}
                    onSelect={(_event, value) => {
                      scriptTypeField.onChange(value);
                    }}
                    testId={`script-type-${index}`}
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
          onClick: handleAddScript,
        }}
        removeButton={{
          onClick: handleRemoveScript,
        }}
      />
    </div>
  );
};

export default NewScriptsFields;

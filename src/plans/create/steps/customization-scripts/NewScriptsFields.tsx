import type { FC } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

import Select from '@components/common/Select';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { useScriptFieldValidation } from './hooks/useScriptFieldValidation';
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

const NewScriptsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getValues, setValue, trigger } = useCreatePlanFormContext();

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
  const { nameDeps, triggerAllNames, validateName } = useScriptFieldValidation(
    CustomScriptsFieldId.Scripts,
    trigger,
    () => getValues(CustomScriptsFieldId.Scripts),
  );

  return (
    <div className="pf-v6-u-ml-lg">
      <FieldBuilderTable
        addButton={{
          label: t('Add script'),
          onClick: () => {
            append({ ...DefaultScript });
          },
        }}
        fieldRows={scripts.map((fieldRow, index) => {
          const guestType = watchedScripts?.[index]?.guestType ?? GuestType.Linux;
          const isWindows = guestType === GuestType.Windows;
          return {
            ...fieldRow,
            additionalOptions: (
              <Controller
                control={control}
                name={getScriptFieldId(index, 'content')}
                render={({ field }) => (
                  <ScriptContentField
                    guestType={guestType}
                    onChange={field.onChange}
                    value={field.value ?? ''}
                  />
                )}
              />
            ),
            inputs: [
              <Controller
                control={control}
                key="name"
                name={getScriptFieldId(index, 'name')}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <TextInput
                      {...field}
                      data-testid={`script-name-${index}`}
                      placeholder={t('Script name')}
                      validated={getInputValidated(error)}
                    />
                    <FormErrorHelperText error={error} />
                  </>
                )}
                rules={{ deps: nameDeps(scripts.length), validate: validateName(index) }}
              />,
              <Controller
                control={control}
                key="guestType"
                name={getScriptFieldId(index, 'guestType')}
                render={({ field: guestTypeField }) => (
                  <Select
                    id={getScriptFieldId(index, 'guestType')}
                    onSelect={async (_event, value) => {
                      guestTypeField.onChange(value);
                      if (value === GuestType.Windows) {
                        setValue(getScriptFieldId(index, 'scriptType'), ScriptType.Firstboot);
                      }
                      await triggerAllNames(scripts.length);
                    }}
                    testId={`script-guest-type-${index}`}
                    value={GuestTypeLabels[guestTypeField.value as GuestType]}
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
                control={control}
                key="scriptType"
                name={getScriptFieldId(index, 'scriptType')}
                render={({ field: scriptTypeField }) => (
                  <Select
                    id={getScriptFieldId(index, 'scriptType')}
                    onSelect={async (_event, value) => {
                      scriptTypeField.onChange(value);
                      await triggerAllNames(scripts.length);
                    }}
                    testId={`script-type-${index}`}
                    value={ScriptTypeLabels[scriptTypeField.value as ScriptType]}
                  >
                    <SelectList>
                      {Object.values(ScriptType).map((st) => (
                        <SelectOption
                          description={
                            isWindows && st === ScriptType.Run
                              ? t('Run scripts are only available for Linux')
                              : undefined
                          }
                          isDisabled={isWindows && st === ScriptType.Run}
                          key={st}
                          value={st}
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
        headers={[
          { label: ScriptsFieldLabels.name, width: 35 },
          { label: ScriptsFieldLabels.guestType, width: 25 },
          { label: ScriptsFieldLabels.scriptType, width: 25 },
        ]}
        removeButton={{
          onClick: (index) => {
            if (scripts.length > 1) {
              remove(index);
            } else {
              setValue(CustomScriptsFieldId.Scripts, [DefaultScript]);
            }
          },
        }}
      />
    </div>
  );
};

export default NewScriptsFields;

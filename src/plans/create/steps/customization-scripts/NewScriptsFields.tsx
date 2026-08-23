import type { FC } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { getScriptFieldInputs } from './components/ScriptFieldInputs';
import { useScriptFieldValidation } from './hooks/useScriptFieldValidation';
import {
  CustomScriptsFieldId,
  DefaultScript,
  GuestType,
  ScriptsFieldLabels,
  ScriptType,
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
                    value={(field.value as string | undefined) ?? ''}
                  />
                )}
              />
            ),
            inputs: getScriptFieldInputs({
              control,
              fieldPrefix: CustomScriptsFieldId.Scripts,
              guestType,
              index,
              nameDeps,
              onGuestTypeChange: async (value) => {
                if (value === GuestType.Windows) {
                  setValue(getScriptFieldId(index, 'scriptType'), ScriptType.Firstboot);
                }
                await triggerAllNames(scripts.length);
              },
              onScriptTypeChange: async () => {
                await triggerAllNames(scripts.length);
              },
              scriptsLength: scripts.length,
              t,
              validateName,
            }),
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

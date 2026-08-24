import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { getScriptFieldInputs } from 'src/plans/create/steps/customization-scripts/components/ScriptFieldInputs';
import {
  DefaultScript,
  GuestType,
  ScriptsFieldLabels,
  ScriptType,
} from 'src/plans/create/steps/customization-scripts/constants';
import { createScriptFieldValidation } from 'src/plans/create/steps/customization-scripts/hooks/createScriptFieldValidation';
import ScriptContentField from 'src/plans/create/steps/customization-scripts/ScriptContentField';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
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
  const { nameDeps, triggerAllNames, validateName } = createScriptFieldValidation(
    SCRIPTS_FIELD,
    triggerByName,
    () => getValues(SCRIPTS_FIELD),
  );

  return (
    <FieldBuilderTable
      addButton={{
        label: t('Add script'),
        onClick: () => {
          append(DefaultScript);
        },
      }}
      fieldRows={fields.map((fieldRow, index) => {
        const guestType = watchedScripts?.[index]?.guestType ?? GuestType.Linux;

        return {
          ...fieldRow,
          additionalOptions: (
            <Controller
              control={control}
              name={`scripts.${index}.content`}
              render={({ field: { onChange, value } }) => (
                <ScriptContentField guestType={guestType} onChange={onChange} value={value} />
              )}
              rules={{ validate: (value) => validateScriptContent(value) }}
            />
          ),
          inputs: getScriptFieldInputs({
            control,
            fieldPrefix: SCRIPTS_FIELD,
            guestType,
            index,
            nameDeps,
            onGuestTypeChange: async (value) => {
              if (value === GuestType.Windows) {
                setValue(`scripts.${index}.scriptType`, ScriptType.Firstboot);
              }
              await triggerAllNames(fields.length);
            },
            onScriptTypeChange: async () => {
              await triggerAllNames(fields.length);
            },
            scriptsLength: fields.length,
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
          remove(index);
        },
      }}
    />
  );
};

export default ScriptEditTable;

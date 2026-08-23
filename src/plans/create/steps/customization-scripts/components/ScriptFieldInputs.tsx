import type { ReactElement } from 'react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

import Select from '@components/common/Select';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';

import { GuestType, GuestTypeLabels, ScriptType, ScriptTypeLabels } from '../constants';

type GetScriptFieldInputsArgs<T extends FieldValues> = {
  control: Control<T>;
  fieldPrefix: string;
  guestType: GuestType;
  index: number;
  nameDeps: (length: number) => string[];
  onGuestTypeChange: (value: GuestType) => Promise<void>;
  onScriptTypeChange: (value: ScriptType) => Promise<void>;
  scriptsLength: number;
  t: (key: string) => string;
  validateName: (index: number) => (value: string) => true | string;
};

export const getScriptFieldInputs = <T extends FieldValues>({
  control,
  fieldPrefix,
  guestType,
  index,
  nameDeps,
  onGuestTypeChange,
  onScriptTypeChange,
  scriptsLength,
  t,
  validateName,
}: GetScriptFieldInputsArgs<T>): ReactElement[] => {
  const isWindows = guestType === GuestType.Windows;
  const nameField = `${fieldPrefix}.${index}.name` as Path<T>;
  const guestTypeField = `${fieldPrefix}.${index}.guestType` as Path<T>;
  const scriptTypeField = `${fieldPrefix}.${index}.scriptType` as Path<T>;

  return [
    <Controller
      control={control}
      key="name"
      name={nameField}
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
      rules={{ deps: nameDeps(scriptsLength) as Path<T>[], validate: validateName(index) }}
    />,
    <Controller
      control={control}
      key="guestType"
      name={guestTypeField}
      render={({ field: guestTypeControllerField }) => (
        <Select
          id={`${fieldPrefix}.${index}.guestType`}
          onSelect={async (_event, value) => {
            guestTypeControllerField.onChange(value);
            await onGuestTypeChange(value as GuestType);
          }}
          testId={`script-guest-type-${index}`}
          value={GuestTypeLabels[guestTypeControllerField.value as GuestType]}
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
      name={scriptTypeField}
      render={({ field: scriptTypeControllerField }) => (
        <Select
          id={`${fieldPrefix}.${index}.scriptType`}
          onSelect={async (_event, value) => {
            scriptTypeControllerField.onChange(value);
            await onScriptTypeChange(value as ScriptType);
          }}
          testId={`script-type-${index}`}
          value={ScriptTypeLabels[scriptTypeControllerField.value as ScriptType]}
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
  ];
};

import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  GuestType,
  GuestTypeLabels,
  ScriptType,
  ScriptTypeLabels,
} from 'src/plans/create/steps/customization-scripts/constants';
import ScriptContentField from 'src/plans/create/steps/customization-scripts/ScriptContentField';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/Select';
import {
  Button,
  ButtonVariant,
  FormSection,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { validateScriptContent, validateUniqueScriptName } from '../../utils/validateScripts';

type ScriptEditRowProps = {
  index: number;
  onRemove: () => void;
  scriptNames: string[];
  showRemove: boolean;
};

const ScriptEditRow: FC<ScriptEditRowProps> = ({ index, onRemove, scriptNames, showRemove }) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useFormContext<{ scripts: CustomScript[] }>();

  const guestType = useWatch({ control, name: `scripts.${index}.guestType` });
  const isWindows = guestType === GuestType.Windows;

  return (
    <FormSection data-testid={`script-edit-row-${index}`}>
      <Controller
        control={control}
        name={`scripts.${index}.name`}
        rules={{ validate: (value) => validateUniqueScriptName(value, index, scriptNames) }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormGroupWithErrorText label={t('Name')} isRequired fieldId={`scripts.${index}.name`}>
            <TextInput
              id={`scripts.${index}.name`}
              onChange={onChange}
              value={value}
              validated={getInputValidated(error)}
              data-testid={`script-name-input-${index}`}
            />
          </FormGroupWithErrorText>
        )}
      />

      <Controller
        control={control}
        name={`scripts.${index}.guestType`}
        render={({ field: { onChange, value } }) => (
          <FormGroupWithErrorText label={t('Guest type')} fieldId={`scripts.${index}.guestType`}>
            <Select
              id={`scripts.${index}.guestType`}
              value={GuestTypeLabels[value]}
              onSelect={(_event, val) => {
                onChange(val);

                if (val === GuestType.Windows) {
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
          </FormGroupWithErrorText>
        )}
      />

      <Controller
        control={control}
        name={`scripts.${index}.scriptType`}
        render={({ field: { onChange, value } }) => (
          <FormGroupWithErrorText label={t('Script type')} fieldId={`scripts.${index}.scriptType`}>
            <Select
              id={`scripts.${index}.scriptType`}
              value={ScriptTypeLabels[value]}
              onSelect={(_event, val) => {
                onChange(val);
              }}
              testId={`script-type-select-${index}`}
            >
              <SelectList>
                {Object.values(ScriptType).map((st) => (
                  <SelectOption key={st} value={st} isDisabled={isWindows && st === ScriptType.Run}>
                    {ScriptTypeLabels[st]}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FormGroupWithErrorText>
        )}
      />

      <Controller
        control={control}
        name={`scripts.${index}.content`}
        rules={{ validate: (value) => validateScriptContent(value) }}
        render={({ field: { onChange, value } }) => (
          <FormGroupWithErrorText
            label={t('Content')}
            isRequired
            fieldId={`scripts.${index}.content`}
          >
            <ScriptContentField guestType={guestType} onChange={onChange} value={value} />
          </FormGroupWithErrorText>
        )}
      />

      {showRemove && (
        <Button
          variant={ButtonVariant.link}
          isInline
          isDanger
          onClick={onRemove}
          icon={<MinusCircleIcon />}
          data-testid={`remove-script-${index}`}
        >
          {t('Remove script')}
        </Button>
      )}
    </FormSection>
  );
};

export default ScriptEditRow;

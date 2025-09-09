import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import VersionedCodeEditor from '@components/VersionedCodeEditor/VersionedCodeEditor';
import { Checkbox, Form, FormHelperText, TextInput, Title } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { HOOK_FORM_FIELD_NAMES } from '../state/constants';
import type { HookFormValues } from '../state/types';
import {
  type HookType,
  HookTypeLabel,
  HookTypeLabelLowercase,
  hookTypes,
} from '../utils/constants';

type HooksCodeEditorProps = {
  planEditable: boolean;
  type: HookType;
};

const HooksCodeEditor: FC<HooksCodeEditorProps> = ({ planEditable, type }) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<HookFormValues>();
  const hookTypeLowercase = HookTypeLabelLowercase[type];
  const fieldIdPrefix = `${hookTypeLowercase}-hook`;
  const isPreHook = type === hookTypes.PreHook;

  const isHookSet = useWatch({
    control,
    name: isPreHook ? HOOK_FORM_FIELD_NAMES.preHookSet : HOOK_FORM_FIELD_NAMES.postHookSet,
  });

  return (
    <>
      <Title headingLevel="h3" className="pf-v5-u-mt-lg pf-v5-u-mb-md">
        {t('{{hookType}} migration hook', { hookType: HookTypeLabel[type] })}
      </Title>
      <Form>
        <Controller
          control={control}
          name={isPreHook ? HOOK_FORM_FIELD_NAMES.preHookSet : HOOK_FORM_FIELD_NAMES.postHookSet}
          render={({ field: { onChange, value } }) => (
            <Checkbox
              id={`${fieldIdPrefix}-set`}
              label={t('Enable {{hookTypeLowercase}} migration hook', { hookTypeLowercase })}
              isChecked={value}
              isDisabled={!planEditable}
              onChange={(_, checked) => {
                onChange(checked);
              }}
            />
          )}
        />
        {isHookSet && (
          <>
            <FormGroupWithErrorText
              label={t('Hook runner image')}
              isRequired
              fieldId={
                isPreHook ? HOOK_FORM_FIELD_NAMES.preHookImage : HOOK_FORM_FIELD_NAMES.postHookImage
              }
            >
              <Controller
                control={control}
                name={
                  isPreHook
                    ? HOOK_FORM_FIELD_NAMES.preHookImage
                    : HOOK_FORM_FIELD_NAMES.postHookImage
                }
                rules={{ required: t('Hook runner image is required.') }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    spellCheck="false"
                    type="url"
                    isDisabled={!planEditable}
                    validated={getInputValidated(
                      Boolean(
                        errors[
                          isPreHook
                            ? HOOK_FORM_FIELD_NAMES.preHookImage
                            : HOOK_FORM_FIELD_NAMES.postHookImage
                        ],
                      ),
                    )}
                  />
                )}
              />
              <FormHelperText>
                {t(
                  'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner.',
                )}
              </FormHelperText>
            </FormGroupWithErrorText>
            <FormGroupWithErrorText
              label={t('Ansible playbook')}
              fieldId={
                isPreHook
                  ? HOOK_FORM_FIELD_NAMES.preHookPlaybook
                  : HOOK_FORM_FIELD_NAMES.postHookPlaybook
              }
            >
              <Controller
                control={control}
                name={
                  isPreHook
                    ? HOOK_FORM_FIELD_NAMES.preHookPlaybook
                    : HOOK_FORM_FIELD_NAMES.postHookPlaybook
                }
                render={({ field: { onChange, value } }) => (
                  <VersionedCodeEditor
                    isDarkTheme={isDarkTheme}
                    value={value ?? ''}
                    onChange={onChange}
                    isReadOnly={!planEditable}
                  />
                )}
              />
              <FormHelperText>
                {t(
                  'Optional: Ansible playbook. If you specify a playbook, the image must be hook-runner.',
                )}
              </FormHelperText>
            </FormGroupWithErrorText>
          </>
        )}
      </Form>
    </>
  );
};

export default HooksCodeEditor;

import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import SectionHeading from '@components/headers/SectionHeading';
import VersionedCodeEditor from '@components/VersionedCodeEditor/VersionedCodeEditor';
import { Form, HelperText, HelperTextItem, Switch, TextInput } from '@patternfly/react-core';
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
  const { control, register } = useFormContext<HookFormValues>();
  const isDarkTheme = useIsDarkTheme();
  const hookTypeLowercase = HookTypeLabelLowercase[type];
  const fieldIdPrefix = `${hookTypeLowercase}-hook`;
  const isPreHook = type === hookTypes.PreHook;

  const isHookSet = useWatch({
    control,
    name: isPreHook ? HOOK_FORM_FIELD_NAMES.preHookSet : HOOK_FORM_FIELD_NAMES.postHookSet,
  });

  return (
    <>
      <SectionHeading text={t('{{hookType}} migration hook', { hookType: HookTypeLabel[type] })} />
      <Form>
        <FormGroupWithHelpText label={t('Enable hook')} isRequired fieldId={`${fieldIdPrefix}-set`}>
          <Controller
            control={control}
            name={isPreHook ? HOOK_FORM_FIELD_NAMES.preHookSet : HOOK_FORM_FIELD_NAMES.postHookSet}
            render={({ field: { onChange, value } }) => (
              <Switch
                label={t('Enable {{hookTypeLowercase}} migration hook', { hookTypeLowercase })}
                labelOff={t('Do not enable a {{hookTypeLowercase}} migration hook', {
                  hookTypeLowercase,
                })}
                isChecked={value}
                isDisabled={!planEditable}
                onChange={(_e, checked) => {
                  onChange(checked);
                }}
              />
            )}
          />
        </FormGroupWithHelpText>
        {isHookSet && (
          <>
            <FormGroupWithHelpText
              label={t('Hook runner image')}
              isRequired
              fieldId={`${fieldIdPrefix}-image`}
            >
              <TextInput
                spellCheck="false"
                type="url"
                {...register(
                  isPreHook
                    ? HOOK_FORM_FIELD_NAMES.preHookImage
                    : HOOK_FORM_FIELD_NAMES.postHookImage,
                )}
              />
              <HelperText>
                <HelperTextItem>
                  {t(
                    'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner .',
                  )}
                </HelperTextItem>
              </HelperText>
            </FormGroupWithHelpText>
            <FormGroupWithHelpText
              label={t('Ansible playbook')}
              fieldId={`${fieldIdPrefix}-playbook`}
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
                  />
                )}
              />
              <HelperText>
                <HelperTextItem>
                  {t(
                    'Optional: Ansible playbook. If you specify a playbook, the image must be hook-runner.',
                  )}
                </HelperTextItem>
              </HelperText>
            </FormGroupWithHelpText>
          </>
        )}
      </Form>
    </>
  );
};

export default HooksCodeEditor;

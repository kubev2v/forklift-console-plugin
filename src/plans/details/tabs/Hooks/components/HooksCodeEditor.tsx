import type { FC, FormEvent } from 'react';
import { Base64 } from 'js-base64';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import SectionHeading from '@components/headers/SectionHeading';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { Form, HelperText, HelperTextItem, Switch, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { type HookType, HookTypeLabel, HookTypeLabelLowercase } from '../utils/constants';

type HooksCodeEditorProps = {
  isHookSet: boolean;
  planEditable: boolean;
  image?: string;
  playbook?: string;
  onChangeHookImage: (value: string, event: FormEvent<HTMLInputElement>) => void;
  onChangeHookSet: (checked: boolean, event: FormEvent<HTMLInputElement>) => void;
  onChangeHookPlaybook: (value: string, event: FormEvent<HTMLInputElement>) => void;
  hookType: HookType;
};

const HooksCodeEditor: FC<HooksCodeEditorProps> = ({
  hookType,
  image,
  isHookSet,
  onChangeHookImage,
  onChangeHookPlaybook,
  onChangeHookSet,
  planEditable,
  playbook = '',
}) => {
  const { t } = useForkliftTranslation();
  const hookTypeLowercase = HookTypeLabelLowercase[hookType];
  const fieldIdPrefix = `${hookTypeLowercase}-hook`;
  return (
    <>
      <SectionHeading
        text={t('{{hookType}} migration hook', { hookType: HookTypeLabel[hookType] })}
      />
      <Form>
        <FormGroupWithHelpText label={t('Enable hook')} isRequired fieldId={`${fieldIdPrefix}-set`}>
          <Switch
            label={t('Enable {{hookTypeLowercase}} migration hook', { hookTypeLowercase })}
            labelOff={t('Do not enable a {{hookTypeLowercase}} migration hook', {
              hookTypeLowercase,
            })}
            isChecked={isHookSet}
            isDisabled={!planEditable}
            onChange={(e, value) => {
              onChangeHookSet(value, e);
            }}
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
                value={image}
                type="url"
                onChange={(e, value) => {
                  onChangeHookImage(value, e);
                }}
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
              <CodeEditor
                language={Language.yaml}
                code={Base64.decode(playbook)}
                onChange={onChangeHookPlaybook}
                height="400px"
                isMinimapVisible={false}
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

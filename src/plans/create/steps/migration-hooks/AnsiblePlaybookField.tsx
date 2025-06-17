import type { FC } from 'react';
import { Controller } from 'react-hook-form';
import { Base64 } from 'js-base64';

import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { FormGroup, FormHelperText } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { type HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksSubFieldId, hooksFormFieldLabels } from './utils';

type AnsiblePlaybookFieldProps = {
  fieldId: HooksFormFieldId;
};

const AnsiblePlaybookField: FC<AnsiblePlaybookFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const subFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.AnsiblePlaybook);

  return (
    <FormGroup
      fieldId={subFieldId}
      label={hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
    >
      <Controller
        name={subFieldId}
        control={control}
        render={({ field }) => (
          <CodeEditor
            language={Language.yaml}
            code={Base64.decode(field.value ?? '')}
            onChange={(value) => {
              field.onChange(Base64.encode(String(value)));
            }}
            height="20rem"
            isMinimapVisible={false}
          />
        )}
      />

      <FormHelperText>
        {t('If you specify a playbook, the image must be hook-runner.')}
      </FormHelperText>
    </FormGroup>
  );
};

export default AnsiblePlaybookField;

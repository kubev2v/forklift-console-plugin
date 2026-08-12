import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import SdkYamlEditor from '@components/SdkYamlEditor/SdkYamlEditor';
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
        control={control}
        name={subFieldId}
        render={({ field }) => (
          <SdkYamlEditor onChange={field.onChange} value={field.value ?? ''} />
        )}
      />

      <FormHelperText>
        {t('If you specify a playbook, the image must be hook-runner.')}
      </FormHelperText>
    </FormGroup>
  );
};

export default AnsiblePlaybookField;

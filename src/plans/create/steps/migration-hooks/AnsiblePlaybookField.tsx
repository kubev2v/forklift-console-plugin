import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import VersionedCodeEditor from '@components/VersionedCodeEditor/VersionedCodeEditor';
import { FormGroup, FormHelperText } from '@patternfly/react-core';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { type HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksSubFieldId, hooksFormFieldLabels } from './utils';

type AnsiblePlaybookFieldProps = {
  fieldId: HooksFormFieldId;
};

const AnsiblePlaybookField: FC<AnsiblePlaybookFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
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
          <VersionedCodeEditor
            isDarkTheme={isDarkTheme}
            value={field.value ?? ''}
            onChange={field.onChange}
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

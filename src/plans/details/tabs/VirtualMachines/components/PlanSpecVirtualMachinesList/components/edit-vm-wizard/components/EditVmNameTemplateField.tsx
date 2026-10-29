import { type FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  Divider,
  Radio,
  Stack,
  StackItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { EDIT_VM_NAME_TEMPLATE_EXAMPLE_EXPRESSION } from '../constants';
import type { EditVmWizardFormValues } from '../types';
import {
  isVmNameTemplateOverrideInvalid,
  isVmNameTemplateOverrideMode,
} from '../utils/editVmNamingTemplateValidation';

import { EditVmNameTemplateOverrideHelpers } from './EditVmNameTemplateExpressionHelper';
import EditVmNameTemplateVariables from './EditVmNameTemplateVariables';
import EditVmWizardSubsectionTitle from './EditVmWizardSubsectionTitle';

type EditVmNameTemplateFieldProps = {
  allowedVariables: string[];
  description: string;
  fieldId: keyof Pick<
    EditVmWizardFormValues,
    'networkNameTemplate' | 'pvcNameTemplate' | 'volumeNameTemplate'
  >;
  inheritValue?: string;
  showDivider: boolean;
  title: string;
};

const EditVmNameTemplateField: FC<EditVmNameTemplateFieldProps> = ({
  allowedVariables,
  description,
  fieldId,
  inheritValue,
  showDivider,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const { setValue, watch } = useFormContext<EditVmWizardFormValues>();
  const templateValue = watch(fieldId);
  const isOverrideMode = isVmNameTemplateOverrideMode(templateValue);
  const isInvalid = isVmNameTemplateOverrideInvalid(templateValue);
  const [showEmptyOverrideError, setShowEmptyOverrideError] = useState(false);
  const showFieldValidation = isInvalid && showEmptyOverrideError;
  const inheritDescription = t('Set to: {{value}}', {
    value: isEmpty(inheritValue) ? t('default') : inheritValue,
  });

  return (
    <Stack hasGutter>
      <StackItem>
        <EditVmWizardSubsectionTitle description={description} title={title} />
      </StackItem>
      <StackItem className="edit-vm-name-template-radio-group">
        <Radio
          data-testid={`${fieldId}-inherit-radio`}
          description={inheritDescription}
          id={`${fieldId}-inherit`}
          isChecked={!isOverrideMode}
          label={t('Inherit plan wide setting')}
          name={`${fieldId}-mode`}
          onChange={() => {
            setShowEmptyOverrideError(false);
            setValue(fieldId, undefined, { shouldDirty: true });
          }}
        />
        <Radio
          data-testid={`${fieldId}-override-radio`}
          id={`${fieldId}-override`}
          isChecked={isOverrideMode}
          label={t('Override for this VM')}
          name={`${fieldId}-mode`}
          onChange={() => {
            setShowEmptyOverrideError(false);
            setValue(fieldId, templateValue ?? '', { shouldDirty: true });
          }}
        />
      </StackItem>
      {isOverrideMode && (
        <StackItem className="edit-vm-name-template-override-field">
          <TextInput
            aria-label={t('Template')}
            data-testid={`${fieldId}-input`}
            id={`${fieldId}-input`}
            onBlur={() => {
              setShowEmptyOverrideError(true);
            }}
            onChange={(_event, val) => {
              setValue(fieldId, val, { shouldDirty: true });
            }}
            validated={showFieldValidation ? ValidatedOptions.error : ValidatedOptions.default}
            value={templateValue ?? ''}
          />
          <EditVmNameTemplateOverrideHelpers
            exampleExpression={EDIT_VM_NAME_TEMPLATE_EXAMPLE_EXPRESSION[fieldId]}
            isInvalid={showFieldValidation}
          />
        </StackItem>
      )}
      <StackItem>
        <EditVmNameTemplateVariables allowedVariables={allowedVariables} />
      </StackItem>
      {showDivider && (
        <StackItem>
          <Divider />
        </StackItem>
      )}
    </Stack>
  );
};

export default EditVmNameTemplateField;

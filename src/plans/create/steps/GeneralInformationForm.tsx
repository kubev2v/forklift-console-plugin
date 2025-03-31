import React, { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import {
  Form,
  FormGroup,
  FormSection,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

export const GeneralInformationForm: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="create-plan-wizard__form">
      <Title headingLevel="h2">{t('General')}</Title>

      <Form>
        <FormSection title={t('Plan information')} titleElement="h3">
          <p>{t('Name your plan and choose the project you would like it to be created in.')}</p>

          <FormGroup
            isRequired
            fieldId={GeneralFormFieldId.PlanName}
            label={generalFormFieldLabels[GeneralFormFieldId.PlanName]}
          >
            <Controller
              name={GeneralFormFieldId.PlanName}
              control={control}
              rules={{
                required: t('Plan name is required.'),
              }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  validated={
                    errors[GeneralFormFieldId.PlanName]
                      ? ValidatedOptions.error
                      : ValidatedOptions.default
                  }
                />
              )}
            />

            <FormErrorHelperText error={errors[GeneralFormFieldId.PlanName]} />
          </FormGroup>
        </FormSection>
      </Form>
    </div>
  );
};

export default GeneralInformationForm;

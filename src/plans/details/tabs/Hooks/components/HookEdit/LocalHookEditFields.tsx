import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  validateHookRunnerImage,
  validateHookServiceAccount,
} from 'src/plans/create/steps/migration-hooks/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import SdkYamlEditor from '@components/SdkYamlEditor/SdkYamlEditor';
import type { V1beta1Plan } from '@forklift-ui/types';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';
import { type HookType, hookTypes } from '../../utils/constants';
import { getServiceAccountHelperText } from '../../utils/utils';

type LocalHookEditFieldsProps = {
  control: Control<HookEditFormValues>;
  plan: V1beta1Plan;
  step: HookType;
};

const LocalHookEditFields: FC<LocalHookEditFieldsProps> = ({ control, plan, step }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <Controller
        control={control}
        name={HookField.Image}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormGroupWithErrorText
            fieldId={HookField.Image}
            helperText={
              isEmpty(error) ? (
                t(
                  'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner.',
                )
              ) : (
                <FormErrorHelperText error={error} showIcon />
              )
            }
            isRequired
            label={t('Hook runner image')}
          >
            <TextInput
              data-testid="hook-runner-image-input"
              onChange={onChange}
              spellCheck="false"
              type="text"
              validated={getInputValidated(error)}
              value={value}
            />
          </FormGroupWithErrorText>
        )}
        rules={{ validate: validateHookRunnerImage }}
      />
      <Controller
        control={control}
        name={HookField.ServiceAccount}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormGroupWithErrorText
            fieldId={HookField.ServiceAccount}
            helperText={
              isEmpty(error) ? (
                getServiceAccountHelperText(step === hookTypes.PreHook, plan)
              ) : (
                <FormErrorHelperText error={error} showIcon />
              )
            }
            label={t('Service account')}
          >
            <TextInput
              data-testid="hook-service-account-input"
              onChange={onChange}
              spellCheck="false"
              type="text"
              validated={getInputValidated(error)}
              value={value}
            />
          </FormGroupWithErrorText>
        )}
        rules={{ validate: validateHookServiceAccount }}
      />
      <FormGroupWithErrorText
        fieldId={HookField.Playbook}
        helperText={t(
          'Ansible playbook. If you specify a playbook, the image must be hook-runner.',
        )}
        label={t('Ansible playbook')}
      >
        <Controller
          control={control}
          name={HookField.Playbook}
          render={({ field: { onChange, value } }) => (
            <SdkYamlEditor onChange={onChange} value={value ?? ''} />
          )}
        />
      </FormGroupWithErrorText>
    </>
  );
};

export default LocalHookEditFields;

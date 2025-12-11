import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  validateHookRunnerImage,
  validateHookServiceAccount,
} from 'src/plans/create/steps/migration-hooks/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import ModalForm from '@components/ModalForm/ModalForm';
import SdkYamlEditor from '@components/SdkYamlEditor/SdkYamlEditor';
import type { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Checkbox, Form, FormGroup, ModalVariant, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getDefaultHookValues } from '../../state/initialState';
import { type HookEditFormValues, HookField } from '../../state/types';
import { type HookType, HookTypeLabelLowercase, hookTypes } from '../../utils/constants';
import { createUpdateOrDeleteHook, getServiceAccountHelperText } from '../../utils/utils';

export type HookEditProps = {
  hook: V1beta1Hook | undefined;
  step: HookType;
  plan: V1beta1Plan;
};

const HookEdit: ModalComponent<HookEditProps> = ({ closeModal, hook, plan, step }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<HookEditFormValues>({
    defaultValues: getDefaultHookValues(hook),
    mode: 'onChange',
  });

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    watch,
  } = methods;

  const enabledHook = watch('enabled');
  const hookTypeLowercase = HookTypeLabelLowercase[step];
  const title = t('Edit {{hookTypeLowercase}} migration hook', { hookTypeLowercase });

  const onSubmit = async (formData: HookEditFormValues) => {
    const { enabled, image, playbook, serviceAccount } = formData;
    await createUpdateOrDeleteHook({
      hook,
      hookImage: image,
      hookPlaybook: playbook,
      hookServiceAccount: serviceAccount,
      hookSet: enabled,
      plan,
      step,
    });

    // Reset the form state to match the new server state
    reset(formData);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={title}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isEmpty(errors) || !isDirty}
      >
        <Form>
          {t(
            'Edit Ansible hook configuration for your migration plan. Hooks are applied to all virtual machines in the plan.',
          )}
          <FormGroup fieldId={HookField.Enabled}>
            <Controller
              control={control}
              name={HookField.Enabled}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  id="enabled-set"
                  name="enabled-set"
                  label={t('Enable {{hookTypeLowercase}} migration hook', { hookTypeLowercase })}
                  isChecked={value}
                  onChange={(_, checked) => {
                    onChange(checked);
                  }}
                />
              )}
            />
          </FormGroup>
          {enabledHook && (
            <>
              <Controller
                control={control}
                name={HookField.Image}
                rules={{
                  validate: validateHookRunnerImage,
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FormGroupWithErrorText
                    label={t('Hook runner image')}
                    isRequired
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
                  >
                    <TextInput
                      onChange={onChange}
                      value={value}
                      spellCheck="false"
                      validated={getInputValidated(error)}
                      type="text"
                    />
                  </FormGroupWithErrorText>
                )}
              />
              <Controller
                control={control}
                name={HookField.serviceAccount}
                rules={{
                  validate: validateHookServiceAccount,
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FormGroupWithErrorText
                    label={t('Service account')}
                    fieldId={HookField.serviceAccount}
                    helperText={
                      isEmpty(error) ? (
                        getServiceAccountHelperText(step === hookTypes.PreHook, plan)
                      ) : (
                        <FormErrorHelperText error={error} showIcon />
                      )
                    }
                  >
                    <TextInput
                      onChange={onChange}
                      value={value}
                      spellCheck="false"
                      validated={getInputValidated(error)}
                      type="text"
                    />
                  </FormGroupWithErrorText>
                )}
              />
              <FormGroupWithErrorText
                label={t('Ansible playbook')}
                fieldId={HookField.Playbook}
                helperText={t(
                  'Ansible playbook. If you specify a playbook, the image must be hook-runner.',
                )}
              >
                <Controller
                  control={control}
                  name={HookField.Playbook}
                  render={({ field: { onChange, value } }) => (
                    <SdkYamlEditor value={value ?? ''} onChange={onChange} />
                  )}
                />
              </FormGroupWithErrorText>
            </>
          )}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default HookEdit;

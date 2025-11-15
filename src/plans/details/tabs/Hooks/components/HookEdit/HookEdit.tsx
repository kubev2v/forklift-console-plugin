import { Controller, FormProvider, useForm } from 'react-hook-form';
import { validateHookRunnerImage } from 'src/plans/create/steps/migration-hooks/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import ModalForm from '@components/ModalForm/ModalForm';
import VersionedCodeEditor from '@components/VersionedCodeEditor/VersionedCodeEditor';
import type { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { getDefaultHookValues } from '../../state/initialState';
import { type HookEditFormValues, HookField } from '../../state/types';
import { type HookType, HookTypeLabelLowercase } from '../../utils/constants';
import { createUpdateOrDeleteHook } from '../../utils/utils';

export type HookEditProps = {
  hook: V1beta1Hook | undefined;
  step: HookType;
  plan: V1beta1Plan;
};

const HookEdit: ModalComponent<HookEditProps> = ({ closeModal, hook, plan, step }) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();

  const methods = useForm<HookEditFormValues>({
    defaultValues: getDefaultHookValues(hook),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = methods;

  const enabledHook = watch('enabled');
  const hookTypeLowercase = HookTypeLabelLowercase[step];
  const title = t('Edit {{hookTypeLowercase}} migration hook', { hookTypeLowercase });

  const onSubmit = async (formData: HookEditFormValues) => {
    const { enabled, image, playbook } = formData;
    await createUpdateOrDeleteHook({
      hook,
      hookImage: image,
      hookPlaybook: playbook,
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
      >
        <Form>
          {t('Edit Ansible hook configuration for your migration plan.')}
          <FormGroup fieldId={HookField.Enabled}>
            <Controller
              control={control}
              name={HookField.Enabled}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  id="enabled-set"
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
              <FormGroupWithErrorText
                label={t('Hook runner image')}
                isRequired
                fieldId={HookField.Image}
              >
                <Controller
                  control={control}
                  name={HookField.Image}
                  rules={{
                    validate: (value: string) => validateHookRunnerImage(value),
                  }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      spellCheck="false"
                      validated={getInputValidated(Boolean(errors.image))}
                    />
                  )}
                />
                <FormHelperText>
                  {t(
                    'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner.',
                  )}
                </FormHelperText>
              </FormGroupWithErrorText>
              <FormGroupWithErrorText label={t('Ansible playbook')} fieldId={HookField.Playbook}>
                <Controller
                  control={control}
                  name={HookField.Playbook}
                  render={({ field: { onChange, value } }) => (
                    <VersionedCodeEditor
                      isDarkTheme={isDarkTheme}
                      value={value ?? ''}
                      onChange={onChange}
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
      </ModalForm>
    </FormProvider>
  );
};

export default HookEdit;

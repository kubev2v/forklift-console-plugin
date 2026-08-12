import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
} from 'src/plans/create/steps/migration-hooks/constants';

import ModalForm from '@components/ModalForm/ModalForm';
import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Flex,
  FlexItem,
  Form,
  FormGroup,
  ModalVariant,
  Radio,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getDefaultHookValues } from '../../state/initialState';
import { type HookEditFormValues, HookField } from '../../state/types';
import { type HookType, HookTypeLabelLowercase } from '../../utils/constants';
import { createUpdateOrDeleteHook } from '../../utils/utils';

import AapHookEditFields from './AapHookEditFields';
import LocalHookEditFields from './LocalHookEditFields';

export type HookEditProps = {
  hook: V1beta1Hook | undefined;
  plan: V1beta1Plan;
  step: HookType;
};

const HookEdit: OverlayComponent<HookEditProps> = ({ closeOverlay, hook, plan, step }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<HookEditFormValues>({
    defaultValues: getDefaultHookValues(hook),
    mode: 'onChange',
  });

  const {
    clearErrors,
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    watch,
  } = methods;

  const hookSource = watch('hookSource');

  useEffect(() => {
    if (hookSource !== HOOK_SOURCE_LOCAL) {
      clearErrors([HookField.Image, HookField.ServiceAccount, HookField.Playbook]);
    }
    if (hookSource !== HOOK_SOURCE_AAP) {
      clearErrors([HookField.AapJobTemplateId]);
    }
  }, [clearErrors, hookSource]);
  const hookTypeLowercase = HookTypeLabelLowercase[step];
  const title = t('Edit {{hookTypeLowercase}} migration hook', { hookTypeLowercase });

  const onSubmit = async (formData: HookEditFormValues): Promise<void> => {
    await createUpdateOrDeleteHook({
      aapJobTemplateId: formData.aapJobTemplateId,
      aapJobTemplateName: formData.aapJobTemplateName,
      hook,
      hookImage: formData.image,
      hookPlaybook: formData.playbook,
      hookServiceAccount: formData.serviceAccount,
      hookSet: formData.hookSource !== HOOK_SOURCE_NONE,
      hookSource: formData.hookSource,
      plan,
      step,
    });

    reset(formData);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isEmpty(errors) || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        title={title}
        variant={ModalVariant.medium}
      >
        <Form>
          {t(
            'Edit hook configuration for your migration plan. Hooks are applied to all virtual machines in the plan.',
          )}
          <FormGroup fieldId={HookField.HookSource} label={t('Hook source')}>
            <Controller
              control={control}
              name={HookField.HookSource}
              render={({ field: { onChange, value } }) => (
                <Split hasGutter>
                  <SplitItem>
                    <Radio
                      data-testid="hook-edit-source-none"
                      id="hook-edit-source-none"
                      isChecked={value === HOOK_SOURCE_NONE}
                      label={t('No hook')}
                      name="hookSource"
                      onChange={() => {
                        onChange(HOOK_SOURCE_NONE);
                      }}
                    />
                  </SplitItem>
                  <SplitItem>
                    <Radio
                      data-testid="hook-edit-source-local"
                      id="hook-edit-source-local"
                      isChecked={value === HOOK_SOURCE_LOCAL}
                      label={t('Local playbook')}
                      name="hookSource"
                      onChange={() => {
                        onChange(HOOK_SOURCE_LOCAL);
                      }}
                    />
                  </SplitItem>
                  <SplitItem>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                    >
                      <FlexItem>
                        <Radio
                          data-testid="hook-edit-source-aap"
                          id="hook-edit-source-aap"
                          isChecked={value === HOOK_SOURCE_AAP}
                          label={t('Ansible Automation Platform')}
                          name="hookSource"
                          onChange={() => {
                            onChange(HOOK_SOURCE_AAP);
                          }}
                        />
                      </FlexItem>
                      <FlexItem>
                        <TechPreviewLabel />
                      </FlexItem>
                    </Flex>
                  </SplitItem>
                </Split>
              )}
            />
          </FormGroup>

          {hookSource === HOOK_SOURCE_LOCAL && (
            <LocalHookEditFields control={control} plan={plan} step={step} />
          )}

          {hookSource === HOOK_SOURCE_AAP && <AapHookEditFields control={control} />}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default HookEdit;

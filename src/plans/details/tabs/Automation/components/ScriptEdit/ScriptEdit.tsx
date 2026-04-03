import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { DefaultScript } from 'src/plans/create/steps/customization-scripts/constants';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Button, ButtonVariant, Content, Form, ModalVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ScriptEditFormValues, ScriptEditProps } from '../../types';
import { saveCustomScripts } from '../../utils/saveCustomScripts';

import ScriptEditTable from './ScriptEditTable';

const ScriptEdit: OverlayComponent<ScriptEditProps> = ({
  closeOverlay,
  configMap,
  plan,
  scripts,
}) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ScriptEditFormValues>({
    defaultValues: { scripts: isEmpty(scripts) ? [DefaultScript] : scripts },
    mode: 'onChange',
  });

  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
  } = methods;

  const { append, fields, remove } = useFieldArray({ control, name: 'scripts' });
  const watchedScripts = useWatch({ control, name: 'scripts' });
  const scriptNames = watchedScripts?.map((script) => script.name) ?? [];

  const onSubmit = async (formData: ScriptEditFormValues): Promise<void> => {
    await saveCustomScripts({ configMap, plan, scripts: formData.scripts });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit customization scripts')}
        closeModal={closeOverlay}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
        testId="script-edit-modal"
      >
        <Form>
          {isEmpty(fields) ? (
            <>
              <Content component="p" className="pf-v6-u-color-200">
                {t('No customization scripts are configured.')}
              </Content>
              <Button
                variant={ButtonVariant.link}
                isInline
                icon={<PlusCircleIcon />}
                onClick={() => {
                  append(DefaultScript);
                }}
                data-testid="add-script-button"
              >
                {t('Add script')}
              </Button>
            </>
          ) : (
            <ScriptEditTable
              append={append}
              fields={fields}
              remove={remove}
              scriptNames={scriptNames}
            />
          )}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default ScriptEdit;

import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
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

  const onSubmit = async (formData: ScriptEditFormValues): Promise<void> => {
    await saveCustomScripts({ configMap, plan, scripts: formData.scripts });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isValid || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        testId="script-edit-modal"
        title={t('Edit customization scripts')}
        variant={ModalVariant.medium}
      >
        <Form>
          {isEmpty(fields) ? (
            <>
              <Content className="pf-v6-u-color-200" component="p">
                {t('No customization scripts are configured.')}
              </Content>
              <Button
                data-testid="add-script-button"
                icon={<PlusCircleIcon />}
                isInline
                onClick={() => {
                  append(DefaultScript);
                }}
                variant={ButtonVariant.link}
              >
                {t('Add script')}
              </Button>
            </>
          ) : (
            <ScriptEditTable append={append} fields={fields} remove={remove} />
          )}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default ScriptEdit;

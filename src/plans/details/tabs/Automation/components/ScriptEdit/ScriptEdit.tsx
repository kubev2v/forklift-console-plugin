import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { DefaultScript } from 'src/plans/create/steps/customization-scripts/constants';
import { scriptsToConfigMapData } from 'src/plans/create/steps/customization-scripts/utils';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Button, ButtonVariant, Form, ModalVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ConfigMapModel } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import type { ScriptEditFormValues, ScriptEditProps } from '../../types';

import ScriptEditRow from './ScriptEditRow';

const ScriptEdit: OverlayComponent<ScriptEditProps> = ({ closeOverlay, configMap, scripts }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ScriptEditFormValues>({
    defaultValues: { scripts },
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
    const newData = scriptsToConfigMapData(formData.scripts);

    await k8sPatch({
      data: [{ op: configMap.data ? REPLACE : ADD, path: '/data', value: newData }],
      model: ConfigMapModel,
      resource: configMap,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit customization scripts')}
        closeModal={closeOverlay}
        variant={ModalVariant.large}
        isDisabled={!isValid || !isDirty}
        testId="script-edit-modal"
      >
        <Form>
          {fields.map((field, index) => (
            <ScriptEditRow
              key={field.id}
              index={index}
              onRemove={() => {
                remove(index);
              }}
              scriptNames={scriptNames}
              showRemove={fields.length > 1}
            />
          ))}
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
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default ScriptEdit;

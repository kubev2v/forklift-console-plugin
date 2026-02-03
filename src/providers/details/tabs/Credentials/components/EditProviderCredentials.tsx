import { FormProvider, useForm } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import ModalForm from '@components/ModalForm/ModalForm';
import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant } from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import CertificateValidationField from '../../../../create/fields/CertificateValidationField';
import type { CreateProviderFormData } from '../../../../create/types';

import { buildSecretData } from './utils/buildSecretData';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import { patchSecretData } from './utils/patchSecretData';
import CredentialFieldsByType from './CredentialFieldsByType';
export type EditProviderCredentialsProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

const EditProviderCredentials: ModalComponent<EditProviderCredentialsProps> = ({
  closeModal,
  provider,
  secret,
}) => {
  const { t } = useForkliftTranslation();
  const providerType = getType(provider);

  const methods = useForm<Partial<CreateProviderFormData>>({
    defaultValues: getDefaultFormValues(secret, provider),
    mode: 'onChange',
  });

  const {
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = methods;

  const onSubmit = async (formData: Partial<CreateProviderFormData>) => {
    const secretData = buildSecretData(formData, provider);
    const isOpenstack = providerType === PROVIDER_TYPES.openstack;

    await patchSecretData(
      {
        ...secret,
        data: secretData,
      },
      isOpenstack, // clean old values for openstack since auth type can change
    );

    reset(formData);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit provider credentials')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isEmpty(errors) || !isDirty}
      >
        <Form>
          <CredentialFieldsByType providerType={providerType} />
          {providerType !== PROVIDER_TYPES.hyperv && <CertificateValidationField />}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default EditProviderCredentials;

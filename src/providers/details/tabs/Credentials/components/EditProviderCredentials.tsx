import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, ModalVariant } from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import CertificateValidationField from '../../../../create/fields/CertificateValidationField';
import type { CreateProviderFormData } from '../../../../create/types';

import { buildSecretData } from './utils/buildSecretData';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import { patchEc2Credentials } from './utils/patchEc2Credentials';
import { patchSecretData } from './utils/patchSecretData';
import CredentialFieldsByType from './CredentialFieldsByType';
export type EditProviderCredentialsProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

const EditProviderCredentials: OverlayComponent<EditProviderCredentialsProps> = ({
  closeOverlay,
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

  const onSubmit = async (formData: Partial<CreateProviderFormData>): Promise<void> => {
    if (providerType === PROVIDER_TYPES.ec2) {
      // EC2 rotates keys in place: patching only the edited keys preserves concurrently rotated
      // target keys that the dialog never displayed.
      await patchEc2Credentials(secret, formData);
    } else {
      await patchSecretData(
        {
          ...secret,
          data: buildSecretData(formData, provider),
        },
        providerType === PROVIDER_TYPES.openstack, // auth type can change, so clean old values
      );
    }

    reset(formData);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isEmpty(errors) || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit provider credentials')}
        variant={ModalVariant.medium}
      >
        <Form>
          <CredentialFieldsByType providerType={providerType} />
          {providerType !== PROVIDER_TYPES.ec2 && providerType !== PROVIDER_TYPES.ova && (
            <CertificateValidationField />
          )}
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default EditProviderCredentials;

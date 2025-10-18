import { type FC, useCallback, useEffect, useState } from 'react';
import { produce } from 'immer';
import { validateVCenterURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVCenterURL';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, ProviderFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { Form } from '@patternfly/react-core';
import {
  getAnnotations,
  getSdkEndpoint,
  getUrl,
  getUseVddkAioOptimization,
  getVddkInitImage,
} from '@utils/crds/common/selectors';
import type { ValidationMsg } from '@utils/validation/Validation';

import VMwareURLEditItems from './VMwareURLEditItems';
import VMwareVddkEditItems from './VMwareVddkEditItems';

type VCenterProviderEditProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  onChange: (newValue: V1beta1Provider) => void;
};

const VCenterProviderEdit: FC<VCenterProviderEditProps> = ({ onChange, provider, secret }) => {
  const url = getUrl(provider);
  const emptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];
  const vddkInitImage = getVddkInitImage(provider);
  const useVddkAioOptimization = getUseVddkAioOptimization(provider);

  const [urlValidation, setUrlValidation] = useState<ValidationMsg>(
    validateVCenterURL(url, secret?.data?.insecureSkipVerify),
  );
  const [vddkInitImageValidation, setVddkInitImageValidation] = useState<ValidationMsg>(
    validateVDDKImage(vddkInitImage),
  );

  // When certificate changes, re-validate the URL
  useEffect(() => {
    setUrlValidation(validateVCenterURL(url, secret?.data?.insecureSkipVerify));
  }, [secret, url]);

  const handleChange = useCallback(
    (id: ProviderFieldsId, value: string | undefined) => {
      const trimmedValue = value?.trim();

      if (id === ProviderFieldsId.Url) {
        setUrlValidation(validateVCenterURL(trimmedValue, secret?.data?.insecureSkipVerify));

        onChange(
          produce(provider, (draft) => {
            draft.spec ??= {};
            draft.spec.url = trimmedValue;
          }),
        );
      }
      if (id === ProviderFieldsId.VddkInitImage) {
        setVddkInitImageValidation(validateVDDKImage(trimmedValue));

        onChange(
          produce(provider, (draft) => {
            draft.spec ??= {};
            draft.spec.settings ??= {};
            draft.spec.settings.vddkInitImage = trimmedValue ?? undefined;
          }),
        );
      }
      if (id === ProviderFieldsId.UseVddkAioOptimization) {
        setVddkInitImageValidation(validateVDDKImage(undefined));

        onChange(
          produce(provider, (draft) => {
            draft.spec ??= {};
            draft.spec.settings ??= {};
            draft.spec.settings.useVddkAioOptimization = trimmedValue ?? undefined;
          }),
        );
      }
      if (id === ProviderFieldsId.EmptyVddkInitImage) {
        setVddkInitImageValidation(validateVDDKImage(undefined));

        onChange(
          produce(provider, (draft) => {
            draft.spec ??= {};
            draft.spec.settings ??= {};
            draft.spec.settings.vddkInitImage = undefined;
            draft.metadata ??= {};
            draft.metadata.annotations ??= {};
            draft.metadata.annotations[EMPTY_VDDK_INIT_IMAGE_ANNOTATION] =
              trimmedValue ?? undefined;
          }),
        );
      }
      if (id === ProviderFieldsId.SdkEndpoint) {
        onChange(
          produce(provider, (draft) => {
            draft.spec ??= {};
            draft.spec.settings ??= {};
            draft.spec.settings.sdkEndpoint = trimmedValue;
          }),
        );
      }
    },
    [onChange, provider, secret?.data?.insecureSkipVerify],
  );

  return (
    <Form>
      <VMwareURLEditItems
        sdkEndpoint={getSdkEndpoint(provider)}
        url={url}
        urlValidation={urlValidation}
        handleChange={handleChange}
      />
      <VMwareVddkEditItems
        vddkInitImage={vddkInitImage}
        emptyVddkInitImage={emptyVddkInitImage}
        useVddkAioOptimization={useVddkAioOptimization}
        vddkInitImageValidation={vddkInitImageValidation}
        handleChange={handleChange}
      />
    </Form>
  );
};

export default VCenterProviderEdit;

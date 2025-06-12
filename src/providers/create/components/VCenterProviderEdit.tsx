import { type FC, useCallback, useEffect, useState } from 'react';
import { validateVCenterURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVCenterURL';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, ProviderFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import {
  getAnnotations,
  getSdkEndpoint,
  getUrl,
  getVddkInitImage,
} from '@utils/crds/common/selectors';

import VMwareURLVddkEditItems from './VMwareURLVddkEditItems';

type VCenterProviderEditProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  onChange: (newValue: V1beta1Provider) => void;
};

const VCenterProviderEdit: FC<VCenterProviderEditProps> = ({ onChange, provider, secret }) => {
  const url = getUrl(provider);
  const emptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];
  const vddkInitImage = getVddkInitImage(provider);

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

        onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
      }
      if (id === ProviderFieldsId.VddkInitImage) {
        setVddkInitImageValidation(validateVDDKImage(trimmedValue));

        onChange({
          ...provider,
          spec: {
            ...provider?.spec,
            settings: {
              ...provider?.spec?.settings,
              vddkInitImage: trimmedValue,
            },
          },
        });
      }
      if (id === ProviderFieldsId.EmptyVddkInitImage) {
        setVddkInitImageValidation(validateVDDKImage(undefined));
        onChange({
          ...provider,
          metadata: {
            ...provider?.metadata,
            annotations: {
              ...provider?.metadata?.annotations,
              'forklift.konveyor.io/empty-vddk-init-image': trimmedValue ?? undefined,
            },
          },
          spec: {
            ...provider?.spec,
            settings: {
              ...provider?.spec?.settings,
              vddkInitImage: '',
            },
          },
        });
      }
      if (id === ProviderFieldsId.SdkEndpoint) {
        onChange({
          ...provider,
          spec: {
            ...provider?.spec,
            settings: {
              ...provider?.spec?.settings,
              sdkEndpoint: trimmedValue,
            },
          },
        });
      }
    },
    [onChange, provider, secret?.data?.insecureSkipVerify],
  );

  return (
    <VMwareURLVddkEditItems
      sdkEndpoint={getSdkEndpoint(provider)}
      url={url}
      vddkInitImage={vddkInitImage}
      emptyVddkInitImage={emptyVddkInitImage}
      urlValidation={urlValidation}
      vddkInitImageValidation={vddkInitImageValidation}
      handleChange={handleChange}
    />
  );
};

export default VCenterProviderEdit;

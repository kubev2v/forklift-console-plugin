import { type FC, useCallback, useState } from 'react';
import { produce } from 'immer';
import { validateEsxiURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateEsxiURL';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, ProviderFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';

import type { V1beta1Provider } from '@kubev2v/types';
import {
  getAnnotations,
  getSdkEndpoint,
  getUrl,
  getVddkInitImage,
} from '@utils/crds/common/selectors';

import VMwareURLVddkEditItems from './VMwareURLVddkEditItems';

type EsxiProviderEditProps = {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
};

const EsxiProviderEdit: FC<EsxiProviderEditProps> = ({ onChange, provider }) => {
  const url = getUrl(provider);
  const emptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];
  const vddkInitImage = getVddkInitImage(provider);

  const [urlValidation, setUrlValidation] = useState<ValidationMsg>(validateEsxiURL(url));
  const [vddkInitImageValidation, setVddkInitImageValidation] = useState<ValidationMsg>(
    validateVDDKImage(vddkInitImage),
  );

  const handleChange = useCallback(
    (id: ProviderFieldsId, value: string | undefined) => {
      const trimmedValue = value?.trim();

      if (id === ProviderFieldsId.Url) {
        setUrlValidation(validateEsxiURL(trimmedValue));

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
            draft.spec.settings.vddkInitImage = trimmedValue;
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
    [onChange, provider],
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

export default EsxiProviderEdit;

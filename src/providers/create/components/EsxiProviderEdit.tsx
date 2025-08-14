import { type FC, useCallback, useState } from 'react';
import { produce } from 'immer';
import { validateEsxiURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateEsxiURL';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, ProviderFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';

import type { V1beta1Provider } from '@kubev2v/types';
import { Form } from '@patternfly/react-core';
import {
  getAnnotations,
  getSdkEndpoint,
  getUrl,
  getUseVddkAioOptimization,
  getVddkInitImage,
} from '@utils/crds/common/selectors';

import VMwareURLEditItems from './VMwareURLEditItems';
import VMwareVddkEditItems from './VMwareVddkEditItems';

type EsxiProviderEditProps = {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
};

const EsxiProviderEdit: FC<EsxiProviderEditProps> = ({ onChange, provider }) => {
  const url = getUrl(provider);
  const emptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];
  const vddkInitImage = getVddkInitImage(provider);
  const useVddkAioOptimization = getUseVddkAioOptimization(provider);

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
    [onChange, provider],
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

export default EsxiProviderEdit;

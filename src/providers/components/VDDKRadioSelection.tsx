import { type FC, useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import { ProviderFormFieldId } from '../create/fields/constants';
import type { CreateProviderFormData } from '../create/types';
import { VddkSetupMode } from '../utils/constants';

import DiskTransferMethodSelection from './DiskTransferMethodSelection';

const VDDKRadioSelection: FC = () => {
  const {
    control,
    formState: { isSubmitted },
    setValue,
    trigger,
  } = useFormContext<CreateProviderFormData>();
  const { isFeatureEnabled } = useFeatureFlags();
  const methodController = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkSetupMode,
  });
  const imageController = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkInitImage,
  });
  const aioController = useController({
    control,
    name: ProviderFormFieldId.VsphereUseVddkAioOptimization,
  });
  const method = methodController.field.value;
  const image = imageController.field.value ?? '';
  const isImageMethod = method === VddkSetupMode.Manual || method === VddkSetupMode.Upload;
  const showValidationError =
    isSubmitted || imageController.fieldState.isTouched || methodController.fieldState.isTouched;
  const methodValidationError = methodController.fieldState.error?.message;
  const onVddkImageChange = useCallback(
    (nextImage: string): void => {
      if (nextImage !== image) {
        setValue(ProviderFormFieldId.VsphereVddkInitImage, nextImage, {
          shouldDirty: true,
          shouldTouch: true,
        });
        trigger(ProviderFormFieldId.VsphereVddkSetupMode).catch(() => undefined);
      }
    },
    [image, setValue, trigger],
  );

  return (
    <DiskTransferMethodSelection
      aioEnabled={Boolean(aioController.field.value)}
      imageError={
        isImageMethod && showValidationError
          ? (imageController.fieldState.error?.message ?? methodValidationError)
          : undefined
      }
      isCopyApplianceEnabled={isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE)}
      method={method}
      methodError={!isImageMethod && showValidationError ? methodValidationError : undefined}
      onAioChange={aioController.field.onChange}
      onMethodChange={(nextMethod) => {
        if (nextMethod !== method) {
          setValue(ProviderFormFieldId.VsphereVddkInitImage, '', {
            shouldDirty: true,
            shouldTouch: true,
          });
          if (nextMethod === VddkSetupMode.CopyAppliance || nextMethod === VddkSetupMode.Skip) {
            aioController.field.onChange(false);
          }
        }
        setValue(ProviderFormFieldId.VsphereVddkSetupMode, nextMethod, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }}
      onVddkImageChange={onVddkImageChange}
      vddkImage={image}
    />
  );
};

export default VDDKRadioSelection;

import DiskTransferMethodSelection from 'src/providers/components/DiskTransferMethodSelection';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, Form, ModalVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import DiskTransferPlacementForm from './DiskTransferPlacementForm';
import TemplateDeletionConfirmation from './TemplateDeletionConfirmation';
import type { EditDiskTransferProps } from './types';
import { useEditDiskTransfer } from './useEditDiskTransfer';

const EditDiskTransfer: OverlayComponent<EditDiskTransferProps> = ({ closeOverlay, ...props }) => {
  const { t } = useForkliftTranslation();
  const {
    canSubmit,
    copyApplianceEnabled,
    imageError,
    isAppliance,
    onConfirm,
    onMethodChange,
    permissionError,
    placementOptions,
    requiresDeletion,
    setValue,
    templateError,
    values,
  } = useEditDiskTransfer(props);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={!canSubmit}
      onConfirm={onConfirm}
      testId="edit-disk-transfer-modal"
      title={t('Edit disk transfer method')}
      variant={ModalVariant.large}
    >
      <Form>
        <DiskTransferMethodSelection
          aioEnabled={values.aioEnabled}
          imageError={imageError}
          isCopyApplianceEnabled={copyApplianceEnabled}
          method={values.method}
          onAioChange={(value) => {
            setValue('aioEnabled', value);
          }}
          onMethodChange={onMethodChange}
          onVddkImageChange={(value) => {
            setValue('vddkImage', value);
          }}
          showCopyApplianceAlert={false}
          vddkImage={values.vddkImage}
        />
        {isAppliance && (
          <DiskTransferPlacementForm
            onChange={(field, value) => {
              setValue(`placement.${field}`, value);
            }}
            options={placementOptions}
            permissionError={permissionError}
            templateError={templateError}
            values={values.placement}
          />
        )}
        {requiresDeletion && (
          <TemplateDeletionConfirmation
            isChecked={values.confirmedDeletion}
            onChange={(value) => {
              setValue('confirmedDeletion', value);
            }}
          />
        )}
        {!isAppliance && (permissionError ?? templateError) && (
          <Alert isInline title={permissionError ?? templateError} variant={AlertVariant.danger}>
            {permissionError && templateError ? templateError : null}
          </Alert>
        )}
      </Form>
    </ModalForm>
  );
};

export default EditDiskTransfer;
